---
name: run-e2e-tests
description: >
  Run Playwright E2E tests for the twenty-front package against a running
  frontend + backend. Distinct from run-tests (which covers twenty-server
  Jest unit/integration tests only). Use this whenever the user asks to run
  E2E tests, browser tests, Playwright tests, or end-to-end tests.
user-invocable: true
allowed-tools: Bash, Read
---

# run-e2e-tests

Run Playwright E2E (browser) tests from `packages/twenty-e2e-testing`.

## Source root

`/home/clive/_Projects/stratum/twenty/source/`

## Environment

Tests default to `http://localhost:3001` (frontend) and `http://localhost:3000`
(backend). Override with environment variables to target UAT.

The auth state is persisted between runs in `.auth/user.json`. If auth has
expired or tests fail with login errors, re-run the setup step first:

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx run twenty-e2e-testing:setup
```

## Run commands

### All tests (local dev stack)

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx test twenty-e2e-testing
```

### All tests against UAT

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && FRONTEND_BASE_URL=https://twenty-uat-0a4c.up.railway.app \
     BACKEND_BASE_URL=https://twenty-uat-0a4c.up.railway.app \
     DEFAULT_LOGIN=clive.freeman@stratumcm.com \
     DEFAULT_PASSWORD=<password> \
     npx nx test twenty-e2e-testing
```

### Specific test file or pattern

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx test twenty-e2e-testing -- --grep "conditional-widget"
```

### Headed mode (see the browser)

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx test:debug twenty-e2e-testing
```

### View HTML report after a run

```bash
cd /home/clive/_Projects/stratum/twenty/source \
  && npx nx test:report twenty-e2e-testing
```

## Test structure

```
packages/twenty-e2e-testing/
├── tests/                     ← .spec.ts test files
│   ├── conditional-widget-visibility.spec.ts  ← our conditional display tests
│   ├── create-record.spec.ts
│   └── workflow-*.spec.ts
├── lib/
│   ├── fixtures/screenshot.ts ← base test fixture (auto-screenshots)
│   ├── pom/                   ← Page Object Models
│   │   ├── pageLayoutWidgets.ts  ← widget visibility helpers (ours)
│   │   ├── recordDetails.ts
│   │   └── ...
│   ├── requests/              ← GraphQL request helpers
│   │   ├── opportunity.ts     ← create/update/delete Opportunity (ours)
│   │   ├── create-workflow.ts
│   │   └── backend.ts
│   └── utils/
│       └── getAccessAuthToken.ts
└── playwright.config.ts
```

## Our custom tests

| Test file | What it guards |
|---|---|
| `tests/conditional-widget-visibility.spec.ts` | 'Loss notes' and 'Loss reason' fields show/hide correctly based on Opportunity `salesStage` — visible only when `CLOSEDLOST` |

## What to run when

| Situation | Command |
|---|---|
| After changing `getTabsWithVisibleWidgets` or `buildWidgetVisibilityContext` | `--grep "conditional-widget"` against UAT |
| After an upstream sync that touches page layout rendering | Full E2E suite against UAT |
| Debugging a specific test failure | `test:debug` (headed mode) |

## Notes

- Tests run sequentially (single worker) — parallelism is disabled in config.
- Screenshots are saved automatically to `run_results/` after every test.
- The `conditional-widget-visibility` suite creates a test Opportunity record via
  GraphQL, runs assertions, then deletes it in `afterAll`. If a test run is
  interrupted, a stale `__e2e_test__` opportunity may remain in UAT — delete it
  manually if needed.
- E2E tests do **not** run on Railway builds (test files are excluded via
  `watchPatterns` in `railway.json`) — safe to commit.
