# Twenty Helm Chart

Deploy Twenty CRM on Kubernetes with configurable server, worker, PostgreSQL, and Redis components. The chart supports using Bitnami subcharts for PostgreSQL and Redis or bundled minimal internal deployments.

## Features
- Server and worker deployments with full env exposure via `values.yaml`.
- Optional Bitnami `postgresql` and `redis` dependencies via conditions.
- Internal lightweight Postgres (Spilo) and Redis when dependencies are disabled.
- PVC-based persistence using dynamic storage classes (no static PV manifests).
- Ingress with configurable annotations, hosts, and TLS.

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for a simple 2-line install with your domain.

## Installing

**Prerequisites:** Kubernetes 1.21+, Helm 3.8+, default StorageClass

Internal DB + Redis (default):
```bash
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --namespace twentycrm --create-namespace
```

Bitnami PostgreSQL/Redis:
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm dependency build ./packages/twenty-docker/helm/twenty
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --namespace twentycrm --create-namespace \
  --set postgresql.enabled=true \
  --set redis.enabled=true
```

External DB/Redis:
```bash
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --namespace twentycrm --create-namespace \
  --set postgresql.enabled=false,db.enabled=false \
  --set db.external.host=db.example.com \
  --set redis.enabled=false,redisInternal.enabled=false
```

## Key Values


See `values.yaml` for a comprehensive list.

## Notes

- Database URL and Redis URL are composed automatically from chart settings
- Default database `twenty` is created via post-install hook
- Access token auto-generated (32 chars) if not provided; reuses existing secret if present
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

**S3:** Set `storage.type=s3` and provide credentials:
```bash
helm install my-twenty ./packages/twenty-docker/helm/twenty \
  --set storage.type=s3 \
  --set storage.s3.bucket=my-bucket \
  --set storage.s3.region=us-east-1 \
  --set storage.s3.accessKeyId=AKIA... \
  --set storage.s3.secretAccessKey=secret
```
