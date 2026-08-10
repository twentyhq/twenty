# CRM team workflow

This is the authoritative workflow for changing the CRM without changing the
live instance accidentally.

New to the project? Read [SHIPPING.md](SHIPPING.md) first — it walks through the
same process in plain language. This document is the rulebook; that one is the
walkthrough.

## Environment boundaries

| Environment | Location | Data | Purpose |
|---|---|---|---|
| Development | Each developer's machine | Developer-owned Postgres, Redis, and storage | Build and test feature branches |
| Staging | Google Cloud, `crm-staging.spec.tech` | Isolated copy of production data | Validate a merged or candidate commit |
| Production | Google Cloud, `crm.spec.tech` | Live CRM data | The instance the team uses |

The boundaries are mandatory:

- Develop only in a clone of this repository on a developer-owned machine.
- Never point development at cloud Postgres, Redis, storage, or environment
  files.
- Never copy production secrets into development or staging.
- Never run development setup, reset, or test commands on a cloud VM.
- Operate staging and production through the GitHub workflows and the private
  `SpeculativeTechnologies/crm-ops` runbooks.
- Only code merged into `main` may be deployed to production.

See [DEVELOPMENT.md](DEVELOPMENT.md), [STAGING.md](STAGING.md), and
[PRODUCTION.md](PRODUCTION.md) for environment-specific instructions.

Application code, migrations, CI, image builds, and promotion workflows belong
in this public repository. Cloud Compose configuration, host scripts, backups,
tunnel configuration, systemd units, and operational runbooks belong in the
private [`crm-ops`](https://github.com/SpeculativeTechnologies/crm-ops)
repository. Use coordinated PRs when a change requires both.

## Starting work

1. Fetch and branch from current `origin/main`:

   ```bash
   git fetch origin
   git switch main
   git pull --ff-only origin main
   git switch -c yourname/short-description
   ```

2. Develop and test on the developer's own machine.
3. Push the branch and open a PR against `SpeculativeTechnologies/CRM:main`.
4. Wait for `ci-fork-status-check` and review.
5. Merge on GitHub. Do not push directly to `main`.

## Pull-request protocol

Every PR should state:

- What changed and why.
- How it was tested.
- Whether it changes the database, environment variables, deployment, user
  permissions, integrations, or background jobs.
- The rollback method.
- Screenshots for visible UI changes.

Review is mandatory by protocol even if GitHub has not yet been configured to
enforce an approval count. Changes in these areas require the production
owner's review:

- `deploy/**`
- `packages/twenty-server/src/database/**`
- authentication, authorization, roles, permissions, and secrets
- email/calendar integrations and background jobs

Entity changes must include their generated instance command. Do not edit the
`up` or `down` of an already-merged command. Regenerate frontend GraphQL types
in the same PR as a GraphQL schema change.

## Promotion protocol

Promotion is forward-only:

```text
feature branch -> pull request/CI -> staging -> production
```

Schema changes travel with the application code that requires them. Developers
must run:

```bash
bash deploy/local-schema.sh sync
```

against an existing local database and test a clean local initialization before
requesting review. Never repair drift with manual production SQL, and never
promote a schema by copying it between environments.

Copying *data* downward is supported only through the mirror pipeline: `bash
deploy/local-data.sh mirror` builds a verified scrubbed copy from the latest
available nightly production backup, installs it on a developer machine, and
brings it forward to the checked-out commit with `local-schema.sh sync`. Schema
still travels only through committed instance commands and workspace upgrades.
See [DEVELOPMENT.md](DEVELOPMENT.md) for what the mirror contains and how it
must be handled.

1. Identify the exact Git commit SHA to test.
2. Ensure CI has published the GHCR image for that SHA. For an unmerged PR,
   adding `needs-staging` triggers the image build.
3. Run **Deploy to staging** with the branch, tag, or SHA. The workflow wakes
   cloud staging, deploys the pinned image, runs migrations and health checks,
   and reports the result.
4. Exercise the change at `https://crm-staging.spec.tech` and record the smoke
   test result.
5. Merge the reviewed PR to `main`.
6. Run **Deploy to production** for the merged SHA. The workflow verifies that
   the commit is on `main` and contains the commit staging ran, then waits for
   the production approval gate before deploying.
7. Follow the private
   [`crm-ops` cloud runbook](https://github.com/SpeculativeTechnologies/crm-ops/blob/main/deploy/CLOUD-OPS.md)
   for operational checks, backups, incidents, and rollback.

Do not use `latest` to identify a staging or production release. Deploys use a
full commit SHA; rollback is another deployment of a known-good SHA.

## Upstream synchronization

Ben owns merges from `twentyhq/twenty`. Upstream changes use a normal
`sync/upstream-YYYY-MM-DD` PR and go through CI, review, staging, and production
like any other change. Do not bypass the PR and promotion workflows.

## Emergency changes

If the normal process must be bypassed:

1. Record why and who authorized it.
2. Back up before any data or schema change.
3. Make the smallest possible change.
4. Open a follow-up PR immediately so Git remains the source of truth.
5. Record verification and rollback results.
