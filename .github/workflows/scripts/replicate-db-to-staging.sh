#!/usr/bin/env bash
set -euo pipefail

# Replicate production DB to staging with anonymization.
# Uses a temporary postgres pod inside the cluster for direct Aurora access.
#
# Required env vars:
#   PROD_NAMESPACE       - k8s namespace for prod (to read RDS secret)
#   STAGING_NAMESPACE    - k8s namespace for staging
#
# Optional env vars:
#   RDS_MASTER_PASSWORD  - Aurora master password (if not set, reads from k8s secret)
#   RDS_MASTER_SECRET    - k8s secret name for master password (default: twenty-rds-master-credentials)
#   RDS_HOST             - Aurora cluster endpoint (default: from helm values)
#   PROD_DB              - Production database name (default: twenty)
#   STAGING_DB           - Staging database name (default: twenty_staging)

PROD_NS="${PROD_NAMESPACE:?PROD_NAMESPACE must be set}"
STAGING_NS="${STAGING_NAMESPACE:?STAGING_NAMESPACE must be set}"

RDS_HOST="${RDS_HOST:-twenty-crm-db.cluster-cgx4wwy00vhj.us-east-1.rds.amazonaws.com}"
PROD_DB="${PROD_DB:-twenty}"
STAGING_DB="${STAGING_DB:-twenty_staging}"
MASTER_USER="postgres"

# Read master password from env var or k8s secret
if [ -z "${RDS_MASTER_PASSWORD:-}" ]; then
  MASTER_SECRET="${RDS_MASTER_SECRET:-twenty-rds-master-credentials}"
  echo "==> Reading RDS master password from k8s secret '$MASTER_SECRET'..."
  MASTER_PASS=$(kubectl get secret "$MASTER_SECRET" -n "$PROD_NS" -o jsonpath='{.data.password}' | base64 -d)
  if [ -z "$MASTER_PASS" ]; then
    echo "ERROR: Could not read master password from secret '$MASTER_SECRET' in namespace '$PROD_NS'."
    echo "Either set RDS_MASTER_PASSWORD env var or create the secret:"
    echo "  kubectl create secret generic $MASTER_SECRET -n $PROD_NS --from-literal=password=YOUR_PASSWORD"
    exit 1
  fi
else
  MASTER_PASS="$RDS_MASTER_PASSWORD"
fi

HELPER_POD="db-replication-helper"
HELPER_IMAGE="postgres:16-alpine"

cleanup() {
  echo "==> Cleaning up helper pod..."
  kubectl delete pod "$HELPER_POD" -n "$PROD_NS" --ignore-not-found --wait=false 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Launching temporary postgres pod for replication..."
echo "  RDS host: $RDS_HOST"
echo "  Prod DB: $PROD_DB -> Staging DB: $STAGING_DB"

kubectl run "$HELPER_POD" -n "$PROD_NS" \
  --image="$HELPER_IMAGE" \
  --restart=Never \
  --env="PGPASSWORD=$MASTER_PASS" \
  --env="PGHOST=$RDS_HOST" \
  --env="PGUSER=$MASTER_USER" \
  --overrides='{
    "spec": {
      "tolerations": [
        {"key": "environment", "operator": "Equal", "value": "production", "effect": "NoSchedule"},
        {"key": "environment", "operator": "Equal", "value": "staging", "effect": "NoSchedule"}
      ]
    }
  }' \
  --command -- sleep 3600

echo "  Waiting for pod to be ready..."
kubectl wait --for=condition=Ready pod/"$HELPER_POD" -n "$PROD_NS" --timeout=60s

echo "==> Verifying RDS connectivity..."
kubectl exec -n "$PROD_NS" "$HELPER_POD" -- psql -d "$PROD_DB" -c "SELECT 1;" > /dev/null
echo "  Connected successfully."

# Step 1: Revoke connections and drop staging database
echo "==> Dropping and recreating staging database..."
kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  psql -d postgres -c "
    -- Prevent new connections
    ALTER DATABASE $STAGING_DB ALLOW_CONNECTIONS false;
    -- Kill existing connections
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = '$STAGING_DB' AND pid <> pg_backend_pid();
  " 2>/dev/null || true

kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  psql -d postgres -c "DROP DATABASE IF EXISTS $STAGING_DB;"

kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  psql -d postgres -c "CREATE DATABASE $STAGING_DB;"

# Step 3: Dump prod and pipe directly to staging (no intermediate file)
echo "==> Streaming prod -> staging (this may take a few minutes)..."
kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  bash -c "
    { echo 'SET session_replication_role = replica;';
      pg_dump -d $PROD_DB \
        --no-owner --no-acl \
        --exclude-table-data='*.file' \
        --exclude-table-data='*.attachment';
      echo 'SET session_replication_role = origin;';
    } | psql -d $STAGING_DB -v ON_ERROR_STOP=0
  "

# Step 4: Anonymize staging data
echo "==> Anonymizing staging data..."
kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  psql -d "$STAGING_DB" -c "
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Null out password hashes (force Google SSO on staging)
    UPDATE core.\"user\" SET \"passwordHash\" = NULL;

    -- Keep real emails so Google OAuth works on staging
    -- (same team, private environment)

    -- Delete refresh tokens
    DELETE FROM core.\"appToken\" WHERE type = 'REFRESH_TOKEN';

    -- Regenerate remaining app tokens
    UPDATE core.\"appToken\"
    SET value = encode(gen_random_bytes(32), 'hex'),
        \"expiresAt\" = NOW() + INTERVAL '30 days';

    -- Rewrite config URLs from prod domain to staging domain
    UPDATE core.\"keyValuePair\"
    SET value = REPLACE(value::text, 'crm.omniaagent.com', 'staging-crm.omniaagent.com')::jsonb
    WHERE type = 'CONFIG_VARIABLE'
      AND value::text LIKE '%crm.omniaagent.com%';
  "

# Step 5: Grant permissions to app user
echo "==> Granting permissions to twenty_app_user..."
kubectl exec -n "$PROD_NS" "$HELPER_POD" -- \
  psql -d "$STAGING_DB" -c "
    DO \$\$
    DECLARE
      schema_name TEXT;
    BEGIN
      FOR schema_name IN
        SELECT nspname FROM pg_namespace
        WHERE nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      LOOP
        EXECUTE format('GRANT USAGE ON SCHEMA %I TO twenty_app_user', schema_name);
        EXECUTE format('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA %I TO twenty_app_user', schema_name);
        EXECUTE format('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA %I TO twenty_app_user', schema_name);
      END LOOP;
    END
    \$\$;
  "

echo "==> DB replication complete (prod '$PROD_DB' -> staging '$STAGING_DB')."
