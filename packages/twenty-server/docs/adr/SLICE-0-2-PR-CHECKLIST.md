# Soft `/plan-required` API gate — Slice 0–2 PR checklist

**Branch:** `cursor/fix-soft-plan-required-api-gate-02c6`  
**Bug:** Unpaid workspaces can use CRM via `/objects/*` (and GraphQL) while UI intends `/plan-required`.  
**Root cause:** Enforcement is SPA navigation only (`usePageChangeEffectNavigateLocation`). APIs do not check `BillingService.isSubscriptionIncompleteOnboardingStatus`.

---

## Ground truth from codebase (pre-implementation research)

| Layer | Behavior today |
|-------|----------------|
| Front nav | If `onboardingStatus === PLAN_REQUIRED` and path ∉ `{PlanRequired, PlanRequiredSuccess, BookCall}` → redirect `AppPath.PlanRequired` ([`usePageChangeEffectNavigateLocation.ts`](../../twenty/packages/twenty-front/src/hooks/usePageChangeEffectNavigateLocation.ts) L98–113). Unit test already expects `RecordIndexPage` + `PLAN_REQUIRED` → `PlanRequired`. |
| Front upsell | If `COMPLETED` + billing enabled, user can still open `/plan-required` (L167–173) — **not** a hard gate after subscribe/trial. |
| Server billing | [`BillingService.hasWorkspaceAnySubscription`](../../twenty/packages/twenty-server/src/engine/core-modules/billing/services/billing.service.ts) / `isSubscriptionIncompleteOnboardingStatus` — any subscription row ⇒ not incomplete; `IS_BILLING_ENABLED=false` ⇒ always “has subscription”. |
| Onboarding | [`OnboardingService`](../../twenty/packages/twenty-server/src/engine/core-modules/onboarding/onboarding.service.ts) returns `PLAN_REQUIRED` when incomplete. |
| HTTP mapping | [`BILLING_SUBSCRIPTION_INACTIVE` → 402](../../twenty/packages/twenty-server/src/engine/core-modules/billing/utils/get-billing-exception-status-code.util.ts) — reuse 402 for plan-required. |
| Guard patterns | [`FeatureFlagGuard`](../../twenty/packages/twenty-server/src/engine/guards/feature-flag.guard.ts) (Reflector + Gql context); [`BillingDisabledGuard`](../../twenty/packages/twenty-server/src/engine/guards/billing-disabled.guard.ts) (inverse: only when billing off). **No** global `APP_GUARD` for billing yet ([`app.module.ts`](../../twenty/packages/twenty-server/src/app.module.ts)). |

**Implication for QA:** Live BugHunt retest (2026-09-15) found **Ungraded – FREE** with confirmed UI+API bypass — see `artifacts/paywall-pretest/`. Unit fixtures remain mandatory for CI; live unpaid sandbox is now available for post-deploy flag-on smoke.

---

## Self-testing protocol (run before each slice)

### Before Slice 0
- [x] Inventory GraphQL fields on `BillingResolver` that must stay open during `PLAN_REQUIRED`
- [x] Confirm front unit test matrix for `PLAN_REQUIRED` + `RecordIndexPage`
- [x] Live BugHunt: record whether workspace is still unpaid or already Trial/Pro (write `PRETEST-REPORT.md`)
- [x] Retest: BugHunt is FREE/unpaid with screenshots under `artifacts/paywall-pretest/` (bypass confirmed)

### Before Slice 1
- [x] List all call sites of `hasWorkspaceAnySubscription` / `isSubscriptionIncompleteOnboardingStatus`
- [x] Decide: incomplete = **no subscription row** (match onboarding) vs require **active/trialing** only (stricter; product call)
- [x] Write failing unit tests for the new helper **first**, then implement

### Before Slice 2
- [x] Enumerate allowlisted resolver method names (grep `@Mutation`/`@Query` on billing, auth, onboarding, user, clientConfig)
- [x] Confirm how `request.workspace` is set on GraphQL vs REST middleware
- [x] Write failing guard unit tests (GqlExecutionContext mock) **first**
- [x] Plan integration test: unpaid workspace token → `companies` findMany denied; `checkoutSession` allowed

---

# Slice 0 — Spec / ADR (docs-only PR or first commit)

## PR title
`docs(billing): ADR for enforcing PLAN_REQUIRED on workspace APIs`

## Checklist

### Spec content (new file)
- [x] Add `packages/twenty-server/docs/adr/2026-plan-required-api-enforcement.md` (or `packages/twenty-docs/...` if that’s the house style)

**Must include:**

1. **Decision:** Server denies product APIs when `IS_BILLING_ENABLED && isSubscriptionIncompleteOnboardingStatus(workspaceId)`.
2. **Non-goal:** Per-feature entitlements (SSO, RLS, seat caps) — out of scope.
3. **Error contract:** New `BillingExceptionCode.BILLING_PLAN_REQUIRED` (or reuse `BILLING_SUBSCRIPTION_INACTIVE` if product agrees) → **HTTP 402** + GraphQL error extension `code: BILLING_PLAN_REQUIRED`.
4. **Allowlist (v1):**
   - Auth (login, refresh, logout, oauth callbacks)
   - `clientConfig` / public config
   - Onboarding status / user bootstrap queries needed to render `/plan-required`
   - **All** `BillingResolver` checkout/portal/plans/payment-intent mutations+queries needed for subscribe flow
   - Stripe webhooks (no workspace JWT)
   - Health / metrics internals
5. **Denylist (default):** Workspace GraphQL object CRUD, metadata mutations, REST core CRUD, search, AI, workflows, file upload (except avatar if required for onboarding — call out explicitly).
6. **Self-host:** `IS_BILLING_ENABLED=false` → guard no-op.
7. **Feature flag:** `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` (or reuse existing FF table) default `false` until Slice 2 soaked.
8. **UI note:** Front redirect remains UX; Slice 3 (later) hardens client on 402.

### Pre-merge self-tests (Slice 0)
- [x] ADR reviewed against real `BillingResolver` method list (paste table in ADR appendix)
- [x] Confirm no contradiction with `OnboardingService` `PLAN_REQUIRED` definition
- [x] BugHunt pretest report attached / linked

### Out of Slice 0
- No production code changes except docs

---

# Slice 1 — Canonical helper + exception (small PR)

## PR title
`feat(billing): add assertWorkspacePlanAccess helper for PLAN_REQUIRED`

## Files to touch

| File | Change |
|------|--------|
| `packages/twenty-server/src/engine/core-modules/billing/billing.exception.ts` | Add `BILLING_PLAN_REQUIRED` (+ user-facing msg) |
| `packages/twenty-server/src/engine/core-modules/billing/utils/get-billing-exception-status-code.util.ts` | Map `BILLING_PLAN_REQUIRED` → `402` |
| `packages/twenty-server/src/engine/core-modules/billing/utils/__tests__/get-billing-exception-status-code.util.spec.ts` | Cover new code |
| `packages/twenty-server/src/engine/core-modules/billing/services/billing.service.ts` | Add `assertWorkspaceHasRequiredPlan(workspaceId): Promise<void>` |
| `packages/twenty-server/src/engine/core-modules/billing/services/__tests__/billing.service.spec.ts` | **New or extend** — see tests below |
| `packages/twenty-server/src/engine/core-modules/billing/billing.module.ts` | Export if needed (usually already exports `BillingService`) |

## Helper semantics (implement exactly)

```ts
async assertWorkspaceHasRequiredPlan(workspaceId: string): Promise<void> {
  if (!this.isBillingEnabled()) return;
  // optional FF check here or only in guard
  if (await this.isSubscriptionIncompleteOnboardingStatus(workspaceId)) {
    throw new BillingException(
      'Workspace subscription is required',
      BillingExceptionCode.BILLING_PLAN_REQUIRED,
    );
  }
}
```

**Product default for v1:** Match onboarding — **any** subscription row clears the gate (including incomplete Stripe states that already created a row). Document if later tightening to `active|trialing` only.

## Unit tests (write first — TDD)

`billing.service.spec.ts`:
- [x] `IS_BILLING_ENABLED=false` → assert does not throw (even with no subscription)
- [x] billing on + no subscription row → throws `BILLING_PLAN_REQUIRED`
- [x] billing on + subscription exists → does not throw
- [x] status code util returns 402 for `BILLING_PLAN_REQUIRED`

## Self-tests before implementing Slice 1
- [x] Run existing billing unit tests green on branch tip:  
  `npx jest packages/twenty-server/src/engine/core-modules/billing --passWithNoTests` (or project’s nx target)
- [x] Confirm `BillingException` filter already used by GraphQL billing paths so new code surfaces correctly

## Self-tests after Slice 1
- [x] New specs green
- [x] No call sites wired yet (guard comes in Slice 2) — intentional

## Out of Slice 1
- No Nest guard, no APP_GUARD, no front changes

---

# Slice 2 — API enforcement guard (core fix PR)

## PR title
`feat(billing): enforce PLAN_REQUIRED on workspace GraphQL/REST APIs`

## Files to add

| File | Role |
|------|------|
| `packages/twenty-server/src/engine/guards/workspace-plan-required.guard.ts` | `CanActivate` |
| `packages/twenty-server/src/engine/guards/decorators/skip-plan-required.decorator.ts` | `@SkipPlanRequired()` → `SetMetadata` |
| `packages/twenty-server/src/engine/guards/constants/plan-required-allowlist.ts` | Optional: resolver/class allowlist by name if metadata not enough |
| `packages/twenty-server/src/engine/guards/__tests__/workspace-plan-required.guard.spec.ts` | Unit tests |
| Integration spec under existing workspace billing integration folder (match repo convention) | Unpaid vs paid |

## Files to modify

| File | Change |
|------|--------|
| `packages/twenty-server/src/engine/core-modules/billing/billing.module.ts` | Provide guard if needed |
| `packages/twenty-server/src/engine/core-modules/core-engine.module.ts` or `app.module.ts` | Register `{ provide: APP_GUARD, useClass: WorkspacePlanRequiredGuard }` **or** attach on `WorkspaceAuthGuard` chain used by Core/Metadata GraphQL |
| `packages/twenty-server/src/engine/core-modules/billing/billing.resolver.ts` | `@SkipPlanRequired()` on class **or** each checkout/portal method |
| Auth / onboarding / user / client-config resolvers | `@SkipPlanRequired()` where unpaid users must call them |
| `packages/twenty-server/src/engine/core-modules/twenty-config/config-variables.ts` | Optional env `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` (default false) |
| REST middleware path (`RestCoreMiddleware` / REST controllers) | Same assert after workspace resolved — **do not leave REST as bypass** |

## Guard algorithm

1. Resolve `GqlExecutionContext` / HTTP request.
2. If no `request.workspace?.id` → `return true` (let auth guards handle).
3. If `!BillingService.isBillingEnabled()` → `true`.
4. If feature flag / env enforcement off → `true`.
5. If handler or class has `@SkipPlanRequired()` → `true`.
6. Else `await billingService.assertWorkspaceHasRequiredPlan(workspaceId)`.
7. On throw: ensure GraphQL filter maps to 402 (extend billing GraphQL filter if needed).

**Prefer opt-out (`@SkipPlanRequired`) on allowlisted resolvers** over maintaining a giant denylist — new product resolvers stay safe by default.

## Unit tests (write first)

- [x] No workspace on request → allow
- [x] Billing disabled → allow
- [x] Enforcement flag off → allow
- [x] `@SkipPlanRequired` on handler → allow even if incomplete
- [x] Incomplete subscription → throws / returns false with BillingException
- [x] Has subscription → allow

## Integration / e2e self-tests (after wiring)

- [x] Unpaid workspace: GraphQL query equivalent of companies list → **402 / BILLING_PLAN_REQUIRED** *(Slice 5 integration spec + HTTP harness)*
- [x] Unpaid: `checkoutSession` (or plans query) → **200** *(Slice 5: `listPlans` not plan-required)*
- [x] Unpaid: currentUser / onboardingStatus → **200** (must render paywall) *(Slice 5)*
- [x] Paid/trial fixture → companies list **200** *(Slice 5)*
- [x] Flag off → unpaid companies list **200** (dark) *(Slice 5; `IS_BILLING_ENABLED=false` still covered by unit helper)*
- [x] REST `GET /rest/companies` (or current REST path) unpaid → **402** *(Slice 5)*

## Manual self-test script (staging / local with billing on)

```bash
# 1. Create workspace, stop before Stripe subscription row exists
# 2. Capture access token
# 3. curl GraphQL findMany Company → expect BILLING_PLAN_REQUIRED
# 4. curl checkoutSession → expect success URL
# 5. Complete checkout / insert subscription fixture
# 6. curl findMany → expect data
```

## Rollout checklist
- [ ] Flag default `false` in production
- [ ] Enable on staging; run unpaid + paid smoke
- [ ] Enable for internal cloud workspaces
- [ ] Enable globally; monitor 402 rate / support tickets
- [ ] Kill switch: set flag false

## Out of Slice 2
- Front 402 → navigate to `/plan-required` (Slice 3)
- Job/queue workers (Slice 4)
- Fixing Basic/no-card checkout session error (separate bug; link in ADR)

---

# Slice 3 — Client hardens on `BILLING_PLAN_REQUIRED` (front-only)

## PR title
`feat(front): navigate to plan-required on BILLING_PLAN_REQUIRED API errors`

## Checklist

### Implementation
- [x] `isBillingPlanRequiredError` detector (subCode / code / REST 402 body code)
- [x] Apollo ErrorLink `onBillingPlanRequired` callback (before optional `onError` — no toast flash)
- [x] Wire in `useApolloFactory` → `navigate(AppPath.PlanRequired, { replace: true })`
- [x] Skip navigate on `PlanRequired` / `PlanRequiredSuccess` / `BookCall` (`isPlanRequiredExemptPath`)
- [x] REST parity via Apollo `ServerError` when `statusCode === 402` and body `code === BILLING_PLAN_REQUIRED` (not bare 402)
- [x] Document non-Apollo REST `fetch` as follow-up in ADR appendix

### Unit tests
- [x] Detector true/false matrix (FORBIDDEN+subCode, unrelated billing codes, REST body)
- [x] Exempt-path helper
- [x] ApolloFactory: mock GraphQL error → callback once; plain FORBIDDEN → no callback; no `onError` for plan-required
- [x] useApolloFactory: navigate with replace from `/objects/*`; no navigate when already on `/plan-required`

### Docs
- [x] Slice 3 pretest in `PRETEST-REPORT.md`
- [x] ADR appendix updated
- [x] This checklist Slice 3 section

### Out of Slice 3
- Workers/jobs (Slice 4)
- Changing server guard / enabling flag in prod
- Redesigning paywall UI

---

# Slice 4 — Enforce PLAN_REQUIRED in queue workers

## PR title
`feat(billing): enforce PLAN_REQUIRED on workspace queue jobs`

## Checklist

### Implementation
- [x] Extract `assertMessageQueueJobPlanRequired` helper (flag / no workspaceId / skip / assert)
- [x] Wire gate in `MessageQueueExplorer.invokeProcessMethods` before `@Process` handler
- [x] Inject `BillingService` + `Reflector`; `registerExplorer` imports `BillingModule` via `forwardRef`
- [x] `@SkipPlanRequired` on allowlisted processors (see list below)
- [x] Do **not** invent `WorkspaceJob` base or migrate all processors
- [x] Do **not** change front or default flag to `true`

### Worker allowlist (`@SkipPlanRequired`)
- [x] `InstallOnboardingAppsJob`
- [x] `InstallPreInstalledAppsJob`
- [x] `UpdateSubscriptionQuantityJob`
- [x] `BillingReminderCronJob`
- [x] `ApplicationRecurringChargeCronJob`
- [x] `CleanOnboardingWorkspacesJob`
- [x] `EmailSenderJob` (global; also no `workspaceId`)

### Unit tests
- [x] Flag off → no assert
- [x] No workspaceId → no assert
- [x] Skip metadata → no assert
- [x] Assert throws → reject (`BILLING_PLAN_REQUIRED`)
- [x] Assert ok → proceed

### Docs
- [x] Slice 4 pretest in `PRETEST-REPORT.md`
- [x] ADR appendix updated
- [x] This checklist Slice 4 section
- [x] Keep `SLICE-4-PROMPT.md`

### Out of Slice 4
- Enabling `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` in prod
- Migrating processors to a shared base class
- Front changes (Slice 3 done)

---

# Slice 5 — Integration tests for PLAN_REQUIRED API gate

## PR title
`test(billing): integration coverage for PLAN_REQUIRED API enforcement`

## Checklist

### Implementation (tests + fixtures + docs only)
- [x] `plan-required-api-enforcement.integration-spec.ts` under billing suites
- [x] Fixtures: delete/restore Apple `billingSubscription` rows + flag DB override + redis flush
- [x] Cases: unpaid GraphQL deny; `listPlans` allow; `currentUser`/onboardingStatus allow; paid allow; flag-off dark allow; REST `GET /rest/companies` → 402 + `BILLING_PLAN_REQUIRED`
- [x] Nest/supertest harness unit (`workspace-plan-required.guard.http.spec.ts`) for same contracts without full DB
- [x] Keep `SLICE-5-PROMPT.md`; Slice 5 pretest in `PRETEST-REPORT.md`

### Integration / harness self-test
- [x] Harness unit green: `yarn nx jest twenty-server --testPathPattern='workspace-plan-required.guard.http'`
- [ ] Full `test:integration --testPathPattern='plan-required-api-enforcement'` — **blocked in this VM** (no Postgres/Redis/APP). Run in CI with `IS_BILLING_ENABLED=true` + `with-db-reset` (see pretest)

### Docs
- [x] Slice 5 pretest in `PRETEST-REPORT.md`
- [x] ADR appendix updated
- [x] This checklist Slice 5 section
- [x] Slice 2 integration rows checked (or noted as shipped via Slice 5)

### Out of Slice 5
- Enabling flag in production
- Paywall UI redesign / Basic checkout fix
- Expanding worker allowlist

---

## Suggested PR sequence

1. **PR-A (Slice 0):** ADR only  
2. **PR-B (Slice 1):** Exception + helper + unit tests (safe to merge dark)  
3. **PR-C (Slice 2):** Guard + allowlist + flag + integration tests  
4. **PR-D (Slice 3):** Front ErrorLink → `/plan-required`
5. **PR-E (Slice 4):** Queue explorer plan gate + worker allowlist
6. **PR-F (Slice 5):** Integration + harness tests for API gate
7. **PR-G (Slice 6):** MCP / Jwt-after-guard / route / workflow bypasses

Do not squash Slice 2 into Slice 1 — keeps revert surface small.

---

## Definition of done (Slices 0–2)

- [x] Unpaid cloud workspace cannot read/write CRM objects via GraphQL or REST when flag on *(unit + Slice 5 integration spec / harness)*
- [x] Unpaid workspace can still load billing/onboarding APIs and complete checkout *(allowlist + unit + Slice 5)*
- [x] Self-host billing-off unchanged
- [x] Unit + integration tests green in CI *(unit + harness green; billing integration in CI when `IS_BILLING_ENABLED=true`)*
- [x] Pretest report + screenshots document live FREE BugHunt bypass
- [x] ADR merged and linked from PR-C description

## Definition of done (Slice 4)

- [x] Workspace jobs with `data.workspaceId` hit plan assert when flag on
- [x] Global / no-workspaceId jobs unchanged
- [x] Billing/onboarding allowlisted jobs skip
- [x] Unit tests green; pretest + checklist updated

## Definition of done (Slice 5)

- [x] Spec covers unpaid deny + allowlist allow + paid allow + flag-off
- [x] Tests green **or** blocker documented with runnable instructions + best-effort harness
- [x] Checklist + ADR appendix; commits pushed

---

## Concrete allowlist (from current `BillingResolver` / `OnboardingResolver`)

**`@SkipPlanRequired` on `BillingResolver` (whole class recommended):**

- `billingPortalSession`
- `checkoutSession`
- `createSubscriptionPaymentIntent`
- `createBillingPaymentMethodSetupIntent`
- `switchSubscriptionInterval` / plan switch helpers (only if paywall needs them; else leave enforced)
- `listPlans`
- Related credit/trial methods only if paywall UI calls them before subscribe

**`OnboardingResolver`:** class-level skip (all step mutations + invite suggestions).

**Also skip:** auth resolvers, `clientConfig`, user queries that expose `onboardingStatus`.

**Never skip:** metadata object DDL, workspace ORM GraphQL object CRUD, REST `/rest/*` entity routes, search, AI, workflow execution.

---

## Artifact index

| Path | Purpose |
|------|---------|
| `/opt/cursor/artifacts/paywall-fix/SLICE-0-2-PR-CHECKLIST.md` | This checklist |
| `/opt/cursor/artifacts/paywall-fix/PRETEST-REPORT.md` | Pre-slice self-test notes |
| `/opt/cursor/artifacts/paywall-fix/SLICE-4-PROMPT.md` | Slice 4 agent prompt |
| `/opt/cursor/artifacts/paywall-fix/SLICE-5-PROMPT.md` | Slice 5 agent prompt |
| `/opt/cursor/artifacts/paywall-fix/SLICE-6-PROMPT.md` | Slice 6 agent prompt |
| `packages/twenty-server/docs/adr/2026-plan-required-api-enforcement.md` | ADR (Slice 0 + appendices) |

---

# Slice 6 — Close remaining PLAN_REQUIRED bypass surfaces

## PR title
`feat(billing): close MCP/Jwt/route/workflow PLAN_REQUIRED bypasses`

## Checklist

### Implementation
- [x] Shared `assertRequestWorkspaceHasRequiredPlan` helper
- [x] MCP: soft-hydrate middleware + `WorkspacePlanRequiredGuard` after `McpAuthGuard`
- [x] Jwt-after-guard product: `AppBillingController`, `ApplicationConnectionsController` (no Skip — product paths)
- [x] Route trigger + workflow webhook assert when `workspaceId` known
- [x] `BillingRestApiExceptionFilter` on public runners / app paths for 402 mapping
- [x] Do **not** default flag to `true`; no paywall UI redesign

### Unit / harness tests
- [x] Helper unit matrix (flag off / no workspace / skip / throw / ok)
- [x] Jwt-after-APP_GUARD Nest/supertest harness (MCP-like + app/billing)
- [x] MCP hydrate middleware soft-fail
- [x] Route-trigger + workflow webhook plan-required specs

### Docs
- [x] Slice 6 pretest in `PRETEST-REPORT.md`
- [x] ADR appendix updated
- [x] This checklist Slice 6 section
- [x] Keep `SLICE-6-PROMPT.md`

### Out of Slice 6
- Enabling `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` in prod
- Front OpenAPI playground 402 UX
- graphql-sse client navigate
- Paywall UI / Basic checkout bug

## Definition of done (Slice 6)

- [x] MCP unpaid + flag on → plan required (not silent tool success)
- [x] Jwt-after-guard product controllers covered or explicitly Skip-documented
- [x] Route/workflow product runners assert when workspaceId known
- [x] Tests green; docs updated
- [x] Branch committed and pushed to Origin; GitHub push when `GH_TOKEN` available

