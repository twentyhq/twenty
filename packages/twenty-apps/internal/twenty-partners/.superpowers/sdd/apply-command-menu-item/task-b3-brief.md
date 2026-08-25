# Task B3 — run the apply write under the app role only

## Why (verified, not theory)

`apply-to-brief` declares `isAuthRequired: true`. That makes the server pass the caller's
`userId`/`userWorkspaceId` into the executor (`route-trigger.service.ts:311`), which mints
TWENTY_APP_ACCESS_TOKEN carrying those user claims
(`logic-function-executor.service.ts:364`). `jwt.auth.strategy.ts:359` therefore builds a
**user** auth context, and `resolve-role-ids-from-auth-context.util.ts` returns TWO roles:
the caller's role AND the app role. `compute-permission-intersection.util.ts:72` ANDs them:

    canUpdateObjectRecords = canUpdateObjectRecords && objPerm.canUpdateObjectRecords === true;

The Partner role has Application `canUpdateObjectRecords: false`, so the intersection is
false and `createApplication` is denied. It throws, and the partner sees the generic
"Something went wrong" message.

Confirmed live: `tim@apple.dev` holds Admin and the route works; `mei@meridian-craft.example`
holds Partner and it fails. The route does NOT run under the app role, contrary to what the
plan assumed.

## The fix (approved by the user)

Drop `isAuthRequired`, forward the caller's Authorization header instead, and have the
function verify that token itself. The function's own token then carries no user claims, so
it runs under the app role and the write succeeds. Identity stays server-verified.

Every fact below is verified in this repo — do not re-derive them, and do not deviate:

- `forwardedRequestHeaders?: string[]` exists on the manifest type
  (`twenty-shared/src/application/logicFunctionManifestType.ts:36`).
- `filterRequestHeaders` has no allowlist, so `authorization` forwards
  (`build-logic-function-event.util.ts:35-48`); its own spec uses that exact header.
- `RoutePayload` is `LogicFunctionEvent`, which has
  `headers: Record<string, string | undefined>` (header keys arrive **lowercased**).
- `/metadata` exposes `currentUser`, guarded only by `UserAuthGuard`, which passes whenever
  `request.user` is set. `validateApplicationToken` sets it for any application token that
  carries user claims. So `currentUser { id }` resolves the caller.
- `MetadataApiClient` is importable from `twenty-client-sdk/metadata` (see
  `twenty-sdk/src/sdk/logic-function/jobs/enqueue-job.ts`).

### 1. `src/modules/application/apply/apply-to-brief.logic-function.ts`

    httpRouteTriggerSettings: {
      path: '/apply-to-brief',
      httpMethod: 'POST',
      isAuthRequired: false,
      forwardedRequestHeaders: ['authorization'],
    },

Keep `timeoutSeconds: 60`.

### 2. `src/modules/shared/http/resolve-partner-from-request.service.ts`

ADD a new exported function. Do NOT change `resolvePartnerFromRequest`, `decodeJwtClaims`,
`buildAppClient`, `errorResponse` or `failureResponse` — six other self-service routes
depend on the current behaviour and stay as they are.

    export const resolvePartnerFromForwardedToken = async (event: {
      headers?: Record<string, string | undefined>;
    }): Promise<ResolvedPartner> => { ... }

Behaviour:
1. Read `event.headers?.authorization`. Missing, or not `Bearer <token>` -> `{ error: 'UNAUTHENTICATED' }`.
2. Verify the token by USING it: `new MetadataApiClient({ headers: { Authorization: <the
   full header value> } }).query({ currentUser: { id: true } })`. Any throw, or no id ->
   `{ error: 'UNAUTHENTICATED' }`. This is the verification step: the server checks the
   signature, so the returned id is trustworthy. Never trust a decoded claim here.
3. `resolvePartnerByUserId(buildAppClient(), userId)`, and return it or
   `{ error: 'NO_PARTNER' }`.

Note that `buildAppClient()` is deliberately still used for step 3 and for every read and
write in the service: that client now carries the app-only token.

Add ONE short `//` comment above the new function saying why two identity paths exist:
`resolvePartnerFromRequest` is for routes that act AS the partner (intersecting with their
role is correct there); this one is for a route that acts ON BEHALF OF the partner under app
authority. No other comments.

### 3. `src/modules/application/apply/services/apply-to-brief.service.ts`

Swap the single call to `resolvePartnerFromRequest(event)` for
`resolvePartnerFromForwardedToken(event)`. Nothing else changes — every refusal path, the
INVITED-fill branch, `loadBrief`, and the return shape all stay exactly as they are.

### 4. Tests

- Extend `src/modules/shared/http/resolve-partner-from-request.test.ts` with cases for the
  new function: no header; header without the `Bearer ` prefix; `currentUser` rejects;
  `currentUser` returns no id; happy path resolving to a partner. Mock `MetadataApiClient`.
- Update the apply-to-brief tests so the event carries
  `headers: { authorization: 'Bearer <token>' }` instead of `userWorkspaceId`. Keep all 15
  existing cases passing, including the `Record not found` -> BRIEF_NOT_OPEN case you added.
- Leave the six self-service route tests untouched. If any of them fails, you changed
  something you should not have.

## Constraints

- Repo rules: named exports, `types` over `interface`, no `any`, short `//` comments only
  where the WHY is surprising, `isDefined`/`isNonEmptyString` from the existing helpers.
- AGENTS.md dependency rule: `logic-functions -> services -> {graphql, connector, mappers}
  -> shared`. The new function belongs in `modules/shared/http/`, where it already sits.
- Do not touch `partner.role.ts`, `configure-partner-rls.ts`, the front component, the
  command menu item, or any other module.

## Report

Run `npx tsc -p tsconfig.json --noEmit`, `yarn test:unit`, `yarn lint`. Commit with a
conventional-commit message and NO AI attribution. Reply in under 12 lines: status, commit
SHA, one-line test summary, and anything you had to decide that this brief did not cover.
