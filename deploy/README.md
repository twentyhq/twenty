# CRM environments and deployment

This directory defines the operating model for the
`SpeculativeTechnologies/CRM` fork.

## Start here

- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) — branching, review, and promotion rules
- [DEVELOPMENT.md](DEVELOPMENT.md) — isolated development on another machine
- [STAGING.md](STAGING.md) — isolated staging on the production Mac
- [PRODUCTION.md](PRODUCTION.md) — current live-instance operations

Developer schema synchronization:

```bash
bash deploy/local-schema.sh check
bash deploy/local-schema.sh sync
bash deploy/local-data.sh seed
bash deploy/local-data.sh verify
```

## Environment summary

```text
developer machine                 production Mac
-----------------                 --------------------------------------
source processes                  staging Docker project
twenty-dev Postgres/Redis           web <explicit bind address>:3020
feature-branch data                 private DB/Redis + named volumes

                                  native production services
                                    backend :3000
                                    frontend :3010
                                    Postgres :5432
                                    Redis :6379
```

Staging and production must never share a database, Redis, storage, environment
file, or mutable source checkout.

## Files

- `compose.staging.yml`, `.env.staging.example`, and `staging.sh` operate local
  staging.
- `test-environment-isolation.sh` checks staging's static isolation properties.
- `serve-public.sh`, `serve-frontend.mjs`, and `publish-frontend.sh` operate the
  current native production instance.
- `update-after-merge.sh` synchronizes dependencies, instance migrations,
  workspace upgrades, and metadata cache after eligible merges.
- `backup-db.sh` creates and verifies a production database dump.
- `docker-compose.yml`, `.env.example`, and `Caddyfile` are the older
  single-VM/container deployment template. They are not the active production
  configuration on this Mac and must not be confused with staging.
