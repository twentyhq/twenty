# Slice 6 prompt — close remaining PLAN_REQUIRED bypass surfaces

Senior-engineer execution brief. Do **not** re-litigate Slices 0–5.

---

## Mission

Implement **Slice 6**: close server entry points that still run **workspace product work without** `assertWorkspaceHasRequiredPlan` when `IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED=true`.

HTTP `APP_GUARD` misses these because workspace is bound **after** the guard, or never set on `request.workspace` (resolved inside the service).

## Highest-value targets (in order)

1. **MCP `/mcp`** — `JwtAuthGuard` binds workspace after `APP_GUARD`. Fix by hydrating workspace in middleware for `ApiPath.Mcp` **or** calling `assertWorkspaceHasRequiredPlan` after bind (shared helper). Do **not** `@SkipPlanRequired` MCP product tools.
2. **Other Jwt-only Nest controllers** that bind after APP_GUARD — e.g. application connections / app-billing: gate product paths; Skip only true billing/checkout surfaces if required for unpaid subscribe.
3. **Public product runners** that know `workspaceId` but never hit the guard — route triggers / workflow webhooks (`route-trigger.service.ts`, workflow webhook controllers): assert once `workspaceId` is known.
4. **Tests** for each fixed path (unit or integration-style).
5. **Defer:** front OpenAPI playground 402 UX; graphql-sse client navigate (server `/metadata` already hydrated).

Reuse `BillingService.assertWorkspaceHasRequiredPlan` + same flag. Prefer a tiny shared helper (e.g. `assertRequestWorkspaceHasRequiredPlan(request)`) over copy-paste.

## Repo / branch / GitHub (mandatory)

- Work in `/workspace/twenty` on `cursor/fix-soft-plan-required-api-gate-02c6`.
- Mirror to `/workspace/twenty-src/`; update `/workspace/artifacts/paywall-fix/` (pretest Slice 6, checklist, ADR appendix, keep this prompt).
- **Commit every logical step** with clear messages.
- **Push to GitHub** (required this slice):
  1. If `GH_TOKEN` or `GITHUB_TOKEN` is in the environment: `gh auth login --with-token`, create/use fork `evan-liu/twenty` (or existing fork), add remote `github`, push branch `cursor/fix-soft-plan-required-api-gate-02c6`.
  2. Also push workspace Origin as today.
  3. If no GitHub token: attempt push, document failure, and still push Origin — then stop with exact “need GH_TOKEN” note (do not invent credentials).

## Self-test before coding

1. Read `WorkspacePlanRequiredGuard`, `app.module.ts` middleware routes, `mcp-core.controller.ts`, `jwt-auth.guard.ts`, route-trigger + workflow webhook controllers.
2. Prove APP_GUARD early-return when `!request.workspace?.id` on MCP.
3. Write **Slice 6 pretest** in `PRETEST-REPORT.md`.
4. Failing tests first where practical.

## Out of scope

- Enabling flag in production by default
- Paywall UI / Basic checkout bug
- Rewriting all public webhooks that are not product CRM execution

## Self-test after

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 24
export PATH="$NVM_DIR/versions/node/v24.21.0/bin:$PATH"
cd /workspace/twenty
yarn nx jest twenty-server --testPathPattern='workspace-plan-required|assertRequestWorkspace|mcp|route-trigger' --passWithNoTests
```

## Definition of done

- [ ] MCP unpaid + flag on → plan required (not silent tool success)
- [ ] Jwt-after-guard product controllers covered or explicitly Skip-documented
- [ ] Route/workflow product runners assert when workspaceId known
- [ ] Tests green; docs updated
- [ ] Branch committed **and pushed to GitHub** (or blocker documented with secret request)

## Context

- Prior: `SLICE-5-PROMPT.md`, guard, MQ explorer gate
- Branch tip already has Slices 0–5
