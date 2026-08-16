#!/bin/sh
# SOURCING: none — fork overlay; adds RELATIONS to core.view_type_enum
set -eu

if [ -z "${PG_DATABASE_URL:-}" ]; then
  echo "add-relations-view-type: PG_DATABASE_URL is unset" >&2
  exit 1
fi

psql "$PG_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'RELATIONS' AFTER 'LIST';
SELECT e.enumlabel
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'core' AND t.typname = 'view_type_enum'
ORDER BY e.enumsortorder;
SQL
