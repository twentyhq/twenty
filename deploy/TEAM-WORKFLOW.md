# CRM team workflow

This is the authoritative workflow for changing the CRM without changing the
live instance accidentally.

## Environment boundaries

| Environment | Location | Data | Purpose |
|---|---|---|---|
| Development | Each developer's machine | Developer-owned Postgres, Redis, and storage | Build and test feature branches |
| Staging | Ben's Mac, Docker project `twenty-staging` | Staging-only Docker volumes | Validate a merged or candidate commit |
| Production | Ben's Mac, `/Users/ben/Deploy/twenty` | Machine-local production Postgres, Redis, and storage | Live CRM |

The boundaries are mandatory:

- Never develop in `/Users/ben/Deploy/twenty`.
- Never point development or staging at `localhost:5432`, `localhost:6379`, or
  the production `.env` files on Ben's Mac.
- Never copy production secrets into development or staging.
- Never run `packages/twenty-utils/setup-dev-env.sh` on the production Mac. Its
  default datastore ports are the ports currently used by production.
- Staging must be operated through `bash deploy/staging.sh ...`.
- Only code merged into `main` may be deployed to production.

See [DEVELOPMENT.md](DEVELOPMENT.md), [STAGING.md](STAGING.md), and
[PRODUCTION.md](PRODUCTION.md) for environment-specific instructions.

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
requesting review. Never copy a schema from staging or production back to a
developer database, and never repair drift with manual production SQL.

1. Identify the exact Git commit SHA to promote.
2. Refresh staging from the current production snapshot.
3. Stage the GHCR image tagged with that full SHA.
4. Run staging isolation, migration, and feature smoke tests.
5. For database-changing releases, take and verify a production backup.
6. Deploy that same SHA to production.
7. Record the SHA, operator, time, migration result, and smoke-test result.

Do not use `latest` to identify a staging or production release. Keep the
previous SHA available for rollback.

## Upstream synchronization

Ben owns merges from `twentyhq/twenty`. Upstream changes use a normal
`sync/upstream-YYYY-MM-DD` PR and go through CI, review, staging, and production
like any other change. Do not merge upstream directly into the production
clone.

## Emergency changes

If the normal process must be bypassed:

1. Record why and who authorized it.
2. Back up before any data or schema change.
3. Make the smallest possible change.
4. Open a follow-up PR immediately so Git remains the source of truth.
5. Record verification and rollback results.
