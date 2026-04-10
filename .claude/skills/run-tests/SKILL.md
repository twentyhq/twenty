---
name: run-tests
description: >
  Run unit tests and/or integration tests for the twenty-server package.
  Use this skill whenever the user asks to run tests, check tests pass, or
  verify changes before pushing.
user-invocable: true
allowed-tools: Bash, Read
---

# run-tests

Run unit and/or integration tests for the StratumCM/CRM twenty-server package.

## Source root

`/home/clive/_Projects/stratum/twenty/source/`

## Unit tests

Unit tests use `jest.config.mjs` and run with no external dependencies.

```bash
# Run all unit tests
cd /home/clive/_Projects/stratum/twenty/source/packages/twenty-server \
  && npx jest --config=jest.config.mjs --no-coverage

# Run a specific file or pattern (fast — prefer this during development)
cd /home/clive/_Projects/stratum/twenty/source/packages/twenty-server \
  && npx jest "pattern-or-filename" --config=jest.config.mjs --no-coverage
```

Files matching `*.spec.ts` under `src/` are picked up automatically.

## Integration tests

Integration tests use `jest-integration.config.ts`. They require a running
Postgres and Redis instance (provided by the local dev environment).

```bash
# Run all integration tests (with DB reset — use for CI / clean runs)
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx run twenty-server:test:integration:with-db-reset

# Run all integration tests without resetting the DB (faster for re-runs)
cd /home/clive/_Projects/stratum/twenty/source \
  && NODE_ENV=test NODE_OPTIONS="--max-old-space-size=12288 --import tsx/esm" \
     npx jest --config packages/twenty-server/jest-integration.config.ts

# Run a specific integration test file or pattern
cd /home/clive/_Projects/stratum/twenty/source \
  && NODE_ENV=test NODE_OPTIONS="--max-old-space-size=12288 --import tsx/esm" \
     npx jest --config packages/twenty-server/jest-integration.config.ts "pattern"
```

Files matching `*.integration-spec.ts` under `test/integration/` are picked up.

### Integration test prerequisites

- Local dev environment must be running (Postgres + Redis).
- If not already set up: `bash packages/twenty-utils/setup-dev-env.sh`
- Integration tests spin up a full NestJS app on port 4000 and connect to the
  test DB configured in `packages/twenty-server/.env.test`.

## What to run when

| Situation | Command |
|---|---|
| Quick check after editing a file | Unit test for that file only |
| Before pushing to UAT | All unit tests + integration tests for changed areas |
| After adding a new transition rule | `opportunity-transition-config` integration test |
| Full clean verification | All unit + integration with DB reset |

## Our custom integration tests

| Test file | What it guards |
|---|---|
| `test/integration/opportunity/opportunity-transition-config.integration-spec.ts` | Stage enum values in `OPPORTUNITY_TRANSITION_CONFIG` match actual DB `fieldMetadata` options; all referenced field names are in `OPPORTUNITY_VALIDATION_COLUMNS` and exist as real DB columns |

## Notes

- Integration tests run sequentially (`maxWorkers: 1`) — they take several minutes.
- The `with-db-reset` variant drops and recreates the test DB before running; use
  it when tests are failing unexpectedly or after schema changes.
- Changes to `test/integration/**` do **not** trigger a Railway rebuild (excluded
  via `watchPatterns` in `railway.json`) — safe to push test-only changes.
