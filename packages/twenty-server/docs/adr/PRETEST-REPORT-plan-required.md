# Pretest report — soft `/plan-required` bypass

**Date:** 2026-09-15  
**Workspace under test:** `bughunt.twenty.com` (`afluxed1@gmail.com`)  
**Code reference:** twenty tip on branch `cursor/fix-soft-plan-required-api-gate-02c6`  
**Live browser pretest:** [Reproduce soft paywall bypass](bc-cc8dcf4f-b6e6-5326-8137-6d6516a5da38) → `artifacts/paywall-pretest/`

## Code-level pretest (complete)

| Check | Result |
|-------|--------|
| UI redirects `PLAN_REQUIRED` away from `RecordIndexPage` | **Yes** — unit test + `usePageChangeEffectNavigateLocation` L98–113 |
| UI allows `/plan-required` when `COMPLETED` | **Yes** — L167–173 (upsell; not a hard gate) |
| Server has incomplete-subscription helper | **Yes** — `BillingService.isSubscriptionIncompleteOnboardingStatus` |
| Server globally blocks CRM APIs when incomplete | **No** (pre-Slice-2) — fixed on branch via `WorkspacePlanRequiredGuard` + flag |
| 402 mapping exists for billing | **Yes** — `BILLING_PLAN_REQUIRED` → 402 |

**Conclusion from code:** Even if the SPA redirect works perfectly, **GraphQL/REST remain the bypass surface**. Slice 2 is required.

## Live BugHunt pretest (confirmed unpaid bypass)

Earlier sessions briefly showed Pro/Trial after a card; **retest found BugHunt back in Ungraded – FREE** with an active `/plan-required` wall. That is the unpaid fixture we need.

| Test | Result | Evidence |
|------|--------|----------|
| `/plan-required` | Paywall UI loads (“Ungraded - FREE”, checkout) | `paywall-pretest/A1-plan-required-page-exists.webp` |
| Direct `/objects/companies` | **Bypass** — 39 companies, no redirect | `B3-bypass-success-companies-loaded.webp` |
| Direct `/objects/people` | **Bypass** — 58 people; GraphQL **200** | `B4-people-bypass-with-graphql-200s.webp` |
| Direct `/settings/profile` | **Bypass** — settings load | `B5-settings-profile-loaded.webp` |
| Network | Hundreds of API calls **200 OK** | `C6-network-tab-200-success.webp` |

Full write-up: `artifacts/paywall-pretest/PRETEST-REPORT.md` + `EXECUTIVE-SUMMARY.txt`.

**Root cause (live):** Client-side navigation only. Backend does not deny product APIs for unpaid workspaces (production). Branch fix is dark behind `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED`.

## Allowlist smoke inventory (Slice 0)

Billing methods that unpaid users need (`@SkipPlanRequired` applied in Slice 2):

- `checkoutSession`, `createSubscriptionPaymentIntent`, `createBillingPaymentMethodSetupIntent`, `listPlans`, `billingPortalSession`
- Auth / onboarding / `currentUser` (onboardingStatus) / `clientConfig`

Product paths that must be denied when incomplete + flag on:

- Object findMany/create/update/delete, REST `/rest/*`, metadata mutations

## Sign-off for Slice 0

- [x] Architecture understood from source
- [x] ADR drafted
- [x] Allowlist sketched from `BillingResolver` / `OnboardingResolver`
- [x] Live FREE/unpaid bypass documented (screenshots attached)

## Slice 1 pretest (complete)

### Call sites of plan-incomplete helpers

| Symbol | Callers |
|--------|---------|
| `hasWorkspaceAnySubscription` | `BillingService.isSubscriptionIncompleteOnboardingStatus`; `WorkspaceService` |
| `isSubscriptionIncompleteOnboardingStatus` | `OnboardingService`; `BillingResolver`; `assertWorkspaceHasRequiredPlan` |
| Product decision (v1) | **Any subscription row** clears the gate (match onboarding) |

### Unit self-test results

Helper + status-code + GraphQL mapping specs green (see Slice 1 commit).

## Slice 2 pretest + implementation (complete)

### Registration
- `APP_GUARD` → `WorkspacePlanRequiredGuard`
- Flag: `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` default **false**
- `@SkipPlanRequired` on Billing / Onboarding / Auth / User / ClientConfig

### Guard unit tests green
no workspace / flag off / skip / assert ok / `BILLING_PLAN_REQUIRED` → 402

### Post-fix live verification (still open)
Production BugHunt still bypasses until the branch ships **and** the flag is enabled. Manual retest script once deployed:

```bash
# With flag on + unpaid workspace token
# GraphQL companies findMany → BILLING_PLAN_REQUIRED
# checkoutSession / currentUser → success
```

## Slice 3 pretest (client hardens on `BILLING_PLAN_REQUIRED`)

**Date:** 2026-09-15  
**Scope:** twenty-front only — navigate to `/plan-required` when product APIs return plan-required.

### 1. How GraphQL errors expose codes today

| Piece | Finding |
|-------|---------|
| `apollo.factory.ts` ErrorLink | On `CombinedGraphQLErrors`, calls optional `onError` then walks errors. `UNAUTHENTICATED` → `onUnauthenticatedError`. Switch on `extensions.code`: `FORBIDDEN` / `NOT_FOUND` / etc. **return silently** (no Sentry). Unknown codes → Sentry. |
| `is-graphql-error-of-type.util.ts` | True when `extensions.subCode`, `extensions.code`, or top-level `code` equals the requested string. |
| AI pattern | `isAiChatCreditsExhaustedError` → `isGraphqlErrorOfType(..., BILLING_CREDITS_EXHAUSTED)` (+ quota kind). Local hooks handle UX; **no** global ErrorLink redirect for credits. |

**Implication:** Plan-required must match **`subCode: BILLING_PLAN_REQUIRED`** (server sends `code: FORBIDDEN`). Mirror the AI detector; wire a dedicated ErrorLink callback like `onUnauthenticatedError`.

### 2. Server GraphQL mapping (Slice 1) — confirmed

`billingGraphqlApiExceptionHandler` maps `BillingExceptionCode.BILLING_PLAN_REQUIRED` → GraphQL **`FORBIDDEN`** with **`extensions.subCode === BILLING_PLAN_REQUIRED`** (unit: `billing-graphql-api-exception-handler.util.spec.ts`). HTTP status helper returns **402**.

### 3. `AppPath.PlanRequired` + onboarding redirect — confirmed

- `AppPath.PlanRequired = '/plan-required'`, also `PlanRequiredSuccess`, `BookCall`.
- `usePageChangeEffectNavigateLocation` (L98–113): if `onboardingStatus === PLAN_REQUIRED` and path ∉ `{PlanRequired, PlanRequiredSuccess, BookCall}` → `AppPath.PlanRequired`.
- Unit matrix already expects `RecordIndexPage` + `PLAN_REQUIRED` → `PlanRequired`.
- **Gap Slice 3 closes:** deep-link/`/objects/*` can still fire product GraphQL before/without onboarding status redirect; API 402/`BILLING_PLAN_REQUIRED` must force SPA navigation.

### 4. Apollo wiring site

`useApolloFactory` already supplies `onUnauthenticatedError` / `onAppVersionMismatch` / `onPayloadTooLarge` with `navigate` + `locationRef`. Same place for `onBillingPlanRequired` → `navigate(AppPath.PlanRequired, { replace: true })`, skip when already on PlanRequired / PlanRequiredSuccess / BookCall.

### 5. REST / 402 parity note

SPA product data path is GraphQL. Apollo `RestLink`/`StreamingRestLink` can surface `ServerError` with HTTP 402; REST body from `HttpExceptionHandlerService` includes `code` for `CustomError`. Multiple billing codes share **402** (`CREDITS_EXHAUSTED`, `SUBSCRIPTION_INACTIVE`, `PLAN_REQUIRED`, …), so **do not** redirect on bare 402. Slice 3 will detect REST only when `statusCode === 402` **and** body/`result.code === BILLING_PLAN_REQUIRED` (same detector). Raw non-Apollo `fetch('/rest/...')` remains a follow-up if needed.

### 6. Toast / flash risk

ErrorLink does **not** toast on `FORBIDDEN` today. `useApolloFactory` does not pass a global `onError` snackbar. Reorder: handle plan-required **before** optional `onError` so a custom `onError` cannot flash before redirect. Per-query `useSnackBarOnQueryError` may still race briefly — acceptable; no new global toast for this code.

### Sign-off for Slice 3 pretest

- [x] ErrorLink / FORBIDDEN / AI subCode pattern understood
- [x] Server `FORBIDDEN` + `subCode: BILLING_PLAN_REQUIRED` confirmed
- [x] `AppPath.PlanRequired` + exempt paths confirmed
- [x] Failing unit tests written before implementation (detector + factory callback)

## Slice 4 pretest (queue / cron workers)

**Date:** 2026-09-15  
**Scope:** Gate workspace-scoped message-queue jobs when `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` is on.

### 1. How jobs are dispatched (`MessageQueueExplorer`)

| Piece | Finding |
|-------|---------|
| Entry | `queue.work(async (job) => …)` in `handleProcessorGroupCollection` |
| Workspace id | Already read as `job.data?.workspaceId` for stall monitor + request-scoped `registerRequestByContextId` |
| Invoke path | `handleProcessor` → `invokeProcessMethods` → `instance[method].call(instance, job.data, …)` |
| Choke point | **Single** shared invoke path — ideal place for plan assert (not ~100 `@Processor` classes) |
| No base class | Processors are plain `@Processor` classes; no `WorkspaceJob` base to migrate |

### 2. HTTP gate (Slices 1–2) — confirmed

- `WorkspacePlanRequiredGuard` + `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` (default **false**)
- `@SkipPlanRequired()` / `SKIP_PLAN_REQUIRED_KEY` metadata
- Helper: `BillingService.assertWorkspaceHasRequiredPlan(workspaceId)` (no-op when billing off)

Workers bypass Nest GraphQL/REST guards entirely today → Slice 4 required.

### 3. Allowlist candidates (must keep running unpaid)

| Processor | `workspaceId` in job data? | Skip needed? | Reason |
|-----------|----------------------------|--------------|--------|
| `InstallOnboardingAppsJob` | **Yes** | **Yes** | Onboarding app install before/during plan step |
| `InstallPreInstalledAppsJob` | **Yes** | **Yes** | Workspace creation enqueue (`WorkspaceService`) before plan |
| `UpdateSubscriptionQuantityJob` | **Yes** | **Yes** | Billing housekeeping (seat sync) |
| `BillingReminderCronJob` | No (`handle()`) | Optional (defensive) | Global billing cron |
| `ApplicationRecurringChargeCronJob` | No | Optional (defensive) | Global billing cron |
| `CleanOnboardingWorkspacesJob` | No | Optional (defensive) | Global onboarding cleanup cron |
| `EmailSenderJob` | No (`SendMailOptions`) | Defensive `@SkipPlanRequired` | Global email queue; gate also skipped via missing `workspaceId` |

**Not skipped:** CRM/messaging/calendar/workflow/AI workspace jobs with `data.workspaceId` — assert when flag on.

### 4. DI note

`QueueWorkerModule` imports `CoreEngineModule` (→ `BillingModule`) + `MessageQueueModule.registerExplorer()`. Explorer must inject `BillingService` + `Reflector`; `registerExplorer` needs `BillingModule` (forwardRef if circular with `MessageQueueModule` import in billing).

### Sign-off for Slice 4 pretest

- [x] Explorer choke point + `job.data?.workspaceId` confirmed
- [x] HTTP guard / flag / `@SkipPlanRequired` / assert helper confirmed
- [x] Allowlist documented (onboarding install + pre-installed + billing jobs)
- [x] Failing unit tests for gate helper written before implementation

## Slice 5 pretest (integration / harness for PLAN_REQUIRED API gate)

**Date:** 2026-09-16  
**Scope:** Close Slice 2 DoD gap — unpaid GraphQL/REST deny + allowlist allow, with flag on/off matrix.

### 1. Integration house style

| Piece | Finding |
|-------|---------|
| Request helpers | `makeGraphqlAPIRequest` → `POST /graphql`; `makeRestAPIRequest` → `/rest/*`; `getOnboardingStatus` / `getCurrentUser` via metadata GraphQL |
| Companies findMany | `findManyOperationFactory` + `COMPANY_GQL_FIELDS` (see object-generated suites) |
| Billing suite gate | `jest-integration.config.ts` ignores `test/integration/billing` unless `IS_BILLING_ENABLED=true` (CI appends this to `.env.test`) |
| Config toggle | `createConfigVariable` / `updateConfigVariable` / `deleteConfigVariable` (admin panel) — used by workflow IMAP suites to flip env-backed keys for a describe block |
| Tokens | `APPLE_JANE_ADMIN_ACCESS_TOKEN` + `API_KEY_ACCESS_TOKEN` → Apple seed workspace |
| Subscription seed | Dev seeder inserts one `billingSubscription` (`sub_default0`) with `orIgnore` — exactly one workspace; `getSeededBillingWorkspaceId()` resolves it |
| Unpaid fixture | Incomplete = **zero** subscription rows (`hasWorkspaceAnySubscription`). Cancelled status alone is **not** unpaid. Delete rows + flush `currentBillingSubscription` redis keys; restore after |

### 2. Flag strategy (must not break the rest of the suite)

- Default `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED=false` (dark).
- Suite `beforeAll`: create/update DB override to `true`; `afterAll`: `deleteConfigVariable` → back to DEFAULT false.
- Flag-off case: temporarily delete override (or set `false`), assert companies succeed while unpaid, then re-enable for remaining cases / restore in `afterAll`.
- Suite lives under `test/integration/billing/suites/` so it only runs when billing integration is enabled.

### 3. Environment blocker (this Cloud Agent VM)

| Dependency | Status |
|------------|--------|
| `IS_BILLING_ENABLED=true` | **Required** — without it, `jest-integration.config.ts` **ignores** all of `test/integration/billing` (suite won’t even load) |
| Postgres `localhost:5432` | **Absent** (no docker/psql service) |
| Redis `localhost:6379` | **Absent** |
| App on `APP_PORT` 4000 | **Not running** |

Full `yarn nx run twenty-server:test:integration --testPathPattern='plan-required-api-enforcement'` **cannot execute here** (billing path ignored without flag; no DB/redis/app). Spec is still shipped for CI (`with-db-reset` + `IS_BILLING_ENABLED=true`). Best-effort: Nest/supertest harness unit under `guards/__tests__/` proving HTTP 402 + allowlist/skip + flag-off/paid contracts without DB.

### 4. Run instructions (when DB + redis + seed are up)

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 24
cd /workspace/twenty/packages/twenty-server
# ensure .env.test has IS_BILLING_ENABLED=true (+ Stripe test stubs as in ci-server.yaml)
yarn nx run twenty-server:test:integration --configuration=with-db-reset \
  --testPathPattern='plan-required-api-enforcement'
# unit harness (no DB):
yarn nx jest twenty-server --testPathPattern='workspace-plan-required.guard.http' --passWithNoTests
```

### Sign-off for Slice 5 pretest

- [x] Integration patterns + billing suite gate confirmed
- [x] Unpaid = delete subscription rows (not cancel-only); restore + redis flush planned
- [x] Flag toggle via twenty-config DB override; suite-scoped cleanup
- [x] VM blocker documented; Nest/supertest harness planned as best-effort green path

## Slice 6 pretest (remaining PLAN_REQUIRED bypass surfaces)

**Date:** 2026-09-16  
**Scope:** Close MCP / Jwt-after-APP_GUARD / route-trigger / workflow webhook product paths that bypass `assertWorkspaceHasRequiredPlan` when the enforcement flag is on.

### 1. Prove APP_GUARD early-return on MCP

| Piece | Finding |
|-------|---------|
| `WorkspacePlanRequiredGuard` | Returns `true` when `!request.workspace?.id` (no assert) |
| `app.module.ts` MCP middleware (pre-Slice-6) | Only `ApiRequestContextMiddleware` + `McpMethodGuardMiddleware` — **no** token hydrate |
| `McpCoreController` | `@UseGuards(McpAuthGuard, …)` → `JwtAuthGuard` binds workspace **after** APP_GUARD |
| Result | Unpaid MCP tools succeed with flag on — APP_GUARD never sees workspace |

### 2. Other Jwt-after-guard product controllers

| Controller | Path | Middleware hydrate? | Gate needed? |
|------------|------|---------------------|--------------|
| `McpCoreController` | `/mcp` | No (pre) | **Yes** |
| `AppBillingController` | `/app/billing` | No | **Yes** (product credits/charge; not Stripe checkout) |
| `ApplicationConnectionsController` | `/apps/connections` | No | **Yes** (product) |
| REST `/rest/*` (dashboards, AI, metadata REST, core) | `/rest/...` | Yes (`RestCoreMiddleware`) | Already covered by APP_GUARD |
| GraphQL / metadata / admin-panel | hydrated | Yes | Already covered |

**Skip decision:** Do **not** `@SkipPlanRequired` on MCP tools, app billing, or app connections. Stripe checkout remains on GraphQL `BillingResolver` (already skipped).

### 3. Public product runners (workspaceId known, never hits guard)

| Entry | How workspace is known | Gate |
|-------|------------------------|------|
| `RouteTriggerService.handle` | Host / token resolve → `workspace.id` | Assert once resolved |
| `WorkflowTriggerController.runWorkflow` | `:workspaceId` param after exists check | Assert before CRM execution |

Defer (out of scope): front OpenAPI playground 402 UX; graphql-sse client navigate.

### Sign-off for Slice 6 pretest

- [x] APP_GUARD early-return on MCP proven from source
- [x] Jwt-after-guard inventory done; Skip only true billing/checkout (none of these targets)
- [x] Route/workflow product runners identified
- [x] Shared helper + failing harness planned before implementation
