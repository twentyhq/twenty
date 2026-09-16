# ADR: Enforce `PLAN_REQUIRED` on workspace APIs

- **Status:** Accepted (Slice 1 dark launch)
- **Date:** 2026-09-16

## Context

Frontend onboarding already redirects unpaid workspaces to `/plan-required`, but CRM GraphQL/REST still work without a subscription. Soft paywall is UI-only until the server denies product APIs.

## Decision

1. When `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED=true` (default **false**) and `IS_BILLING_ENABLED=true`, `WorkspacePlanRequiredGuard` (APP_GUARD) calls `BillingService.assertWorkspaceHasRequiredPlan`.
2. Satisfying statuses: `active` | `trialing` | `past_due` | `unpaid`. Incomplete Stripe checkout rows do **not** satisfy.
3. Fail with `BillingExceptionCode.BILLING_PLAN_REQUIRED` → HTTP **402** / GraphQL `FORBIDDEN` + `subCode`.
4. Opt out with `@SkipPlanRequired()` only on intentional allowlist entrypoints.
5. Missing `request.workspace` proceeds (middleware/JWT bind workspace later, or public/unauthenticated). When workspace **is** present without a satisfying plan → deny (fail closed on the product path).
6. Front Apollo ErrorLink navigates to `AppPath.PlanRequired` on `BILLING_PLAN_REQUIRED`.

## Slice 1 `@SkipPlanRequired` allowlist

| Entrypoint | Why |
|------------|-----|
| `AuthResolver` | Login/refresh/session bootstrap |
| `BillingResolver` | Checkout / plans / portal for paywall |
| `OnboardingResolver` | Pre-plan onboarding steps |
| `UserResolver` | `onboardingStatus` / current user bootstrap |
| `ClientConfigController` | App shell + Stripe publishable config |

## Non-goals (later slices)

Message-queue workers, MCP, file/OpenAPI/route/workflow product runners, integration suite.
