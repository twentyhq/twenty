# Twenty Helm Chart

Deploy Twenty CRM on Kubernetes with server, worker, PostgreSQL, and Redis components.

## Features
- Server and worker deployments with full env exposure via `values.yaml`.
- Internal PostgreSQL (Spilo) and Redis deployments included.
- PVC-based persistence using dynamic storage classes (no static PV manifests).
- Ingress with configurable annotations, hosts, and TLS.
- Database readiness and migrations handled by server/worker init containers by default.
– Standard Kubernetes Jobs for DB creation/user and migrations have been removed to simplify installs. Readiness and migrations run in init containers.

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a simple 2-line install with your domain.

## Installing

**Prerequisites:** Kubernetes 1.21+, Helm 3.8+, default StorageClass

Internal DB + Redis (default):
```bash
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --namespace twentycrm --create-namespace
```

External DB/Redis:
```bash
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --namespace twentycrm --create-namespace \
  --set db.enabled=false \
  --set db.external.host=db.example.com \
  --set redisInternal.enabled=false
```

## Key Values


See `values.yaml` for a comprehensive list.

## Notes

- Database URL and Redis URL are composed automatically from chart settings
- Database `twenty` and schema `core` are created automatically by server init container
- No optional jobs: the chart no longer provides separate Jobs for DB or migrations.
- Access token auto-generated (32 chars) if not provided; reuses existing secret if present
  - For production, provide a strong `secrets.tokens.accessToken` value via a secure values file; the auto-generated token is a convenience fallback.
- TLS enabled by default via cert-manager (`acme: true`)
- Requires default StorageClass for PVC provisioning
## Testing

```bash
helm lint ./packages/twenty-docker/helm/twenty
helm template my-twenty ./packages/twenty-docker/helm/twenty
helm plugin install https://github.com/quintush/helm-unittest
helm unittest ./packages/twenty-docker/helm/twenty
```

## Storage

**Local (default):** Uses PVCs for persistence

**S3:** Set `storage.type=s3` and provide credentials using a values file. You can either pass credentials directly or reference an existing Kubernetes Secret.
```bash
# values-secrets.yaml (do not commit)
# storage:
#   type: s3
#   s3:
#     bucket: my-bucket
#     region: us-east-1
#     # Option A: direct values
#     accessKeyId: AKIA...
#     secretAccessKey: ...
#     # Option B: reference a Secret
#     # secretName: my-s3-creds
#     # accessKeyIdKey: accessKeyId
#     # secretAccessKeyKey: secretAccessKey

helm install my-twenty ./packages/twenty-docker/helm/twenty -f values-secrets.yaml
```

## Production Tips

- **Image versioning:** The chart defaults to `Chart.yaml`'s `appVersion` (currently v1.14.0). Override via `image.tag` in values to pin a different version or use `latest` for rolling updates.
- **Keep secrets secure:** Avoid `--set` for sensitive values; use `-f values-secrets.yaml` or reference existing Kubernetes Secrets via `server.extraEnvFrom`.
  - S3 credentials can be referenced via `storage.s3.secretName + accessKeyIdKey/secretAccessKeyKey` to avoid embedding them in pod specs.
