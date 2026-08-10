# Cloud staging

Staging runs on its own Google Cloud VM and is available to authorized users at
`https://crm-staging.spec.tech`. It no longer runs on the production Mac.

## Developer workflow

1. Push the feature branch and open a PR in `SpeculativeTechnologies/CRM`.
2. Add `needs-staging` when an image must be built for an unmerged commit.
3. Run **Deploy to staging** with the branch, tag, or SHA.
4. Wait for the workflow to deploy the pinned image and report success.
5. Exercise the change at `https://crm-staging.spec.tech` before merging.

The workflow in `.github/workflows/deploy-staging.yml` records the exact commit
staging ran. Production uses that record as a promotion gate.

## Operational boundary

Cloud topology, access, data refresh, host commands, backups, logs, incident
response, and rollback belong in the private
[`SpeculativeTechnologies/crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
repository. Its
[`deploy/CLOUD-OPS.md`](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md)
is authoritative.

Do not use `deploy/compose.staging.yml`, `deploy/staging.sh`, the launchd files,
or the old converger instructions to operate cloud staging. Those assets are
retired remnants of the former Mac-hosted environment.
