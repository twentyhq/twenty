# Cloud staging

Staging runs on its own Google Cloud VM and is available to authorized users at
`https://crm-staging.spec.tech`. It no longer runs on the production Mac.

## Developer workflow

1. Develop and verify the change locally, then push the feature branch and open
   a PR in `SpeculativeTechnologies/CRM`.
2. After required CI and review, merge the PR to `main` on GitHub.
3. At the scheduled release window, typically at the end of the day, select the
   exact full SHA on `main` that will be the release candidate and wait for CI
   to publish its image.
4. Run **Deploy to staging** with that exact SHA.
5. Wait for the workflow to deploy the pinned image, run migrations and health
   checks, and report success.
6. Exercise the changed behavior and the normal CRM smoke-test paths at
   `https://crm-staging.spec.tech`. Record an affirmative pass or fail; the
   absence of alerts alone is not a successful smoke test.
7. Promote only the exact SHA that passed. If staging fails, stop and fix or
   revert the issue through another reviewed PR before trying a new `main` SHA.

Pre-merge staging is reserved for unusually risky changes that need cloud
validation before review can finish. Add `needs-staging` to publish an image for
the unmerged PR, then deploy and record its exact SHA. This exception does not
replace CI or review, and the normal release train still stages a selected SHA
from `main` before production.

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
