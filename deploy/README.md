# CRM development and promotion

This directory contains the public repository's local-development tooling,
promotion guidance, and some retired deployment assets. The live cloud runtime
is deliberately documented elsewhere.

## Start here

- [SHIPPING.md](SHIPPING.md) — the human walkthrough from branch to production
- [TEAM-WORKFLOW.md](TEAM-WORKFLOW.md) — authoritative branching, review, and
  promotion rules
- [DEVELOPMENT.md](DEVELOPMENT.md) — isolated local development
- [LLM-LOCAL-DEV.md](LLM-LOCAL-DEV.md) — the same pipeline for coding agents
- [STAGING.md](STAGING.md) and [PRODUCTION.md](PRODUCTION.md) — public workflow
  boundaries and links to the private cloud runbook
- [LLM-FOLK-SYNC.md](LLM-FOLK-SYNC.md) — invariants for writing bidirectional
  Folk connections

## Repository boundary

Use this public `SpeculativeTechnologies/CRM` repository for application code,
schema changes, migrations, tests, CI, image builds, and the GitHub workflows
that promote a commit.

Use the private
[`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
repository for the cloud Compose stack, host deployment and backup scripts,
Cloudflare tunnel configuration, systemd units, access, restores, and incident
response. Its `deploy/CLOUD-OPS.md` is authoritative for the deployed CRM.

## Local data and schema

```bash
bash deploy/local-schema.sh check
bash deploy/local-schema.sh sync
bash deploy/local-data.sh seed     # small synthetic fixture
bash deploy/local-data.sh mirror   # scrubbed copy built from a nightly backup
bash deploy/local-data.sh verify
```

Use the fixture for UI work and CI. Use the mirror for entities, migrations,
workspace upgrades, views, search, and permissions. The mirror is confidential
even after credentials and mailbox content have been removed.

## Environments

```text
developer machine          GitHub Actions          Google Cloud
-----------------          --------------          --------------------------
feature branch       --->  build pinned image ---> isolated staging VM
twenty-dev services        promotion gates    ---> production VM after approval
developer-owned data       deployment result       cloud-owned data and storage
```

Development must never use cloud Postgres, Redis, storage, secrets, or
environment files.

## Retired assets

Files such as `compose.staging.yml`, `staging.sh`, `production-converge.sh`,
`serve-public.sh`, and the launchd definitions describe the former Mac-hosted
deployment. They do not operate the current cloud environments. Do not use them
for staging or production; current equivalents and procedures live in
`crm-ops`.

The mirror tools remain active: `devdata-publish.sh` restores the latest nightly
production backup into a temporary local database, scrubs and verifies it, and
`local-data.sh mirror` installs the resulting dump into `twenty-dev`.
