# ADR: Enforce `PLAN_REQUIRED` on workspace APIs

- **Status:** Proposed
- **Date:** 2026-09-15
- **Branch:** `cursor/fix-soft-plan-required-api-gate-02c6`
- **Related bug:** Soft paywall — SPA sends unpaid workspaces to `/plan-required`, but CRM GraphQL/REST still works via `/objects/*`

## Context

Frontend navigation (`usePageChangeEffectNavigateLocation`) already redirects when `onboardingStatus === PLAN_REQUIRED` (see unit cases for `RecordIndexPage`). That is **UX only**.

Server already knows incompleteness via:

- `BillingService.isSubscriptionIncompleteOnboardingStatus(workspaceId)`
- `OnboardingService` → `OnboardingStatus.PLAN_REQUIRED`

There is **no** Nest guard that blocks object/metadata/REST product APIs for incomplete workspaces. Deep links, scripts, and API tokens can use CRM without a subscription whenever `IS_BILLING_ENABLED` is true.

After a workspace completes checkout/trial, `/plan-required` remains reachable as an upsell route when status is `COMPLETED` — that must not be confused with the unpaid bypass.

## Decision

1. **Server is source of truth.** When billing is enabled and the workspace lacks a satisfying subscription status (`active` / `trialing` / `past_due` / `unpaid`), product APIs must fail with a stable billing error. Incomplete Stripe checkout rows do **not** satisfy the gate.
2. **Onboarding PLAN_REQUIRED** still uses “any subscription row” for SPA navigation. API enforcement is intentionally stricter so `createSubscriptionPaymentIntent` cannot unlock CRM before payment. Front ErrorLink maps `BILLING_PLAN_REQUIRED` → `/plan-required`.
3. **HTTP 402** via new `BillingExceptionCode.BILLING_PLAN_REQUIRED` (map in `get-billing-exception-status-code.util.ts`). Prefer a dedicated code over overloading `BILLING_SUBSCRIPTION_INACTIVE` for clearer client handling.
4. **Allowlist via opt-out:** `@SkipPlanRequired()` on resolvers/controllers that unpaid users must call. Default = enforce once the global guard is enabled.
5. **Feature flag / config:** `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED` (default `false`) wraps enforcement for staged rollout. When `IS_BILLING_ENABLED=false`, enforcement is always off.
6. **UI redirect stays** but is not sufficient alone; Slice 3 maps API `BILLING_PLAN_REQUIRED` → navigate to `/plan-required`.

## Allowlist (v1)

Must work for unpaid workspaces (apply `@SkipPlanRequired`):

| Area | Operations / types |
|------|-------------------|
| Billing | Class-level on `BillingResolver` **or** methods: `checkoutSession`, `createSubscriptionPaymentIntent`, `createBillingPaymentMethodSetupIntent`, `listPlans`, `billingPortalSession` (as needed for paywall UI), related plan listing queries |
| Onboarding | `OnboardingResolver` mutations/queries used before/during plan step |
| Auth | Login/refresh/logout/oauth/SAML callbacks; session bootstrap |
| User bootstrap | Queries that return `onboardingStatus` / current user / workspace (e.g. user field resolvers) |
| Client config | Public/client config needed to render app shell + Stripe key |
| Webhooks | Stripe webhook controllers (no user JWT; skip by “no workspace” or dedicated public path) |
| Health | Health checks |

**Explicitly enforced (no skip):** workspace object GraphQL CRUD, search, metadata DDL, most settings mutations, AI, workflows, file uploads for CRM, REST core entity CRUD.

## Consequences

- Unpaid API clients get 402 instead of silent data access.
- New resolvers are safe by default (must opt out).
- Risk: missing `@SkipPlanRequired` on a paywall dependency → soft-lock; mitigate with allowlist review + staging flag.
- Self-host without billing unchanged.

## Non-goals

- Seat limits, entitlement keys, enterprise feature gates
- Fixing Basic/no-card checkout session errors (track separately; link from rollout notes)

## Implementation slices

| Slice | PR | Deliverable |
|-------|-----|-------------|
| 0 | This ADR | Spec + allowlist |
| 1 | Helper + exception | `assertWorkspaceHasRequiredPlan` + unit tests |
| 2 | Guard + flag | `WorkspacePlanRequiredGuard` + REST parity + integration tests |
| 3 | Front ErrorLink | `isBillingPlanRequiredError` + `onBillingPlanRequired` → `AppPath.PlanRequired` |
| 4 | Workers/jobs | `MessageQueueExplorer` plan gate + `@SkipPlanRequired` on billing/onboarding processors |
| 5 | Integration | Billing suite + Nest/supertest harness for unpaid deny / allowlist / paid / flag-off |
| 6 | Bypass surfaces | MCP hydrate + Jwt-after-guard + route/workflow product runners |

## Appendix — front-end reference

- Onboarding redirect: `packages/twenty-front/src/hooks/usePageChangeEffectNavigateLocation.ts`
- Tests: `packages/twenty-front/src/hooks/__tests__/usePageChangeEffectNavigateLocation.test.ts` (`RecordIndexPage` + `PLAN_REQUIRED` → `PlanRequired`)

## Appendix — Slice 3 client harden (2026-09-15)

When GraphQL returns `FORBIDDEN` + `subCode: BILLING_PLAN_REQUIRED` (or REST 402 with body `code: BILLING_PLAN_REQUIRED`), twenty-front navigates to `/plan-required` even if the user is mid-route on `/objects/*`.

| File | Role |
|------|------|
| `packages/twenty-front/src/modules/apollo/utils/isBillingPlanRequiredError.ts` | Detector (subCode / code / REST body) |
| `packages/twenty-front/src/modules/apollo/utils/isPlanRequiredExemptPath.ts` | Skip navigate on PlanRequired / PlanRequiredSuccess / BookCall |
| `packages/twenty-front/src/modules/apollo/services/apollo.factory.ts` | ErrorLink → `onBillingPlanRequired` (before optional `onError`) |
| `packages/twenty-front/src/modules/apollo/hooks/useApolloFactory.ts` | `navigate(AppPath.PlanRequired, { replace: true })` |

**REST note:** Bare HTTP 402 is not redirected (shared by credits exhausted / inactive subscription). Only 402 + `code: BILLING_PLAN_REQUIRED` in Apollo `ServerError.bodyText`. Non-Apollo `fetch('/rest/...')` remains a follow-up if needed.

## Appendix — Slice 4 queue workers (2026-09-15)

Workspace jobs bypass GraphQL/REST guards. Gate at `MessageQueueExplorer.invokeProcessMethods` via `assertMessageQueueJobPlanRequired` + `BillingService.assertWorkspaceHasRequiredPlan`.

| Condition | Behavior |
|-----------|----------|
| Flag off | Proceed |
| No `job.data.workspaceId` | Proceed (global crons / email) |
| `@SkipPlanRequired` on handler or processor class | Proceed |
| Else | Assert plan; throw fails the job |

**Worker allowlist (`@SkipPlanRequired`):** `InstallOnboardingAppsJob`, `InstallPreInstalledAppsJob`, `UpdateSubscriptionQuantityJob`, `BillingReminderCronJob`, `ApplicationRecurringChargeCronJob`, `CleanOnboardingWorkspacesJob`, `EmailSenderJob`.

## Appendix — Slice 5 integration tests (2026-09-16)

Closes Slice 2 DoD gap for unpaid GraphQL/REST deny + allowlist allow.

| File | Role |
|------|------|
| `test/integration/billing/suites/plan-required-api-enforcement.integration-spec.ts` | Full matrix vs running app (billing suite; needs `IS_BILLING_ENABLED=true`) |
| `test/integration/billing/utils/plan-required-api-enforcement-fixtures.util.ts` | Delete/restore Apple subscription rows; flag DB override; redis flush |
| `src/engine/guards/__tests__/workspace-plan-required.guard.http.spec.ts` | Nest/supertest harness: 402 body, `@SkipPlanRequired`, paid, flag-off, GraphQL FORBIDDEN+subCode |

**Run (CI / local with DB):** `yarn nx run twenty-server:test:integration --configuration=with-db-reset --testPathPattern='plan-required-api-enforcement'` after appending `IS_BILLING_ENABLED=true` (+ Stripe stubs) to `.env.test` as in `ci-server.yaml`.

**Harness (no DB):** `yarn nx jest twenty-server --testPathPattern='workspace-plan-required.guard.http'`.

## Appendix — Slice 6 remaining bypass surfaces (2026-09-16)

HTTP `APP_GUARD` misses paths where workspace is bound **after** the guard (Jwt/Mcp) or never set on `request.workspace` (public runners resolve `workspaceId` inside the service).

| Surface | Fix |
|---------|-----|
| MCP `/mcp` | Soft-hydrate middleware + `WorkspacePlanRequiredGuard` after `McpAuthGuard` |
| `/app/billing`, `/apps/connections` | `WorkspacePlanRequiredGuard` after `JwtAuthGuard` (product; **not** skipped) |
| Route trigger `/s/*` | `assertRequestWorkspaceHasRequiredPlan` once workspace resolved |
| Workflow webhooks `/webhooks/workflows/:workspaceId/:workflowId` | Same assert after workspace exists |

Shared helper: `assertRequestWorkspaceHasRequiredPlan` (mirrors MQ gate). Flag default remains **false**.

| File | Role |
|------|------|
| `src/engine/guards/utils/assert-request-workspace-has-required-plan.util.ts` | Shared gate |
| `src/engine/api/mcp/middlewares/mcp-hydrate-request-from-token.middleware.ts` | Soft hydrate for APP_GUARD |
| `src/engine/guards/__tests__/workspace-plan-required.jwt-after-guard.http.spec.ts` | Nest harness for Jwt-after-APP_GUARD |


## Appendix — Slice 7 edge bypasses (2026-09-16)

Closed additional APP_GUARD timing holes found in edge-case audit:

1. **File upload/download** — `FileUploadTokenGuard` / `FileByIdGuard` now bind `request.workspace = { id }`; route-level `WorkspacePlanRequiredGuard` + `BillingRestApiExceptionFilter` on upload PUT and workspace file GET.
2. **OpenAPI** — `/open-api/core|metadata` (non-`/rest` alias) asserts plan after token→workspace resolve before returning enriched schema.
3. **`/webhooks/server`** — assert plan **only** for dispatch target (customer) workspace before enqueue. Do **not** assert on marketplace publisher/owner workspace (false-positive 402 for all installs).
4. **Predicate tighten:** API gate requires `active|trialing|past_due|unpaid`. Incomplete checkout rows no longer unlock CRM.

### Live fixture note (2026-09-16)

`bughunt.twenty.com` under `afluxed1@gmail.com` is on **Pro Trial** (not unpaid). Soft CRM access there is expected under a satisfying status. True unpaid production fixture blocked by email verification for new signup. Rely on unit/harness/integration specs + prior FREE pretest screenshots.
