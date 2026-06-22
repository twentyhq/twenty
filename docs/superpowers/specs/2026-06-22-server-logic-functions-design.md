# Server (Application-Registration-Scoped) Logic Functions — Design

- **Date:** 2026-06-22
- **Status:** Approved design — pending implementation plan
- **Author:** martmull (with Claude)
- **Origin:** Follow-ups to PR [#21879](https://github.com/twentyhq/twenty/pull/21879) ("Add recall io webhook endpoint") and review thread [r3444439585](https://github.com/twentyhq/twenty/pull/21879#discussion_r3444439585)

## 1. Context

PR #21879 (merged) added a `server-webhook-trigger`: an instance-scoped webhook
endpoint (`POST /webhooks/server/:applicationRegistrationUniversalIdentifier/:logicFunctionUniversalIdentifier`)
that resolves a workspace by reading a `workspaceId` straight out of the payload via a
declarative `workspaceIdResolver` (`source` = body/query/header + dotted `path`), then runs
the **workspace-scoped** copy of the logic function.

The review thread established that this declarative resolution is too limited: real providers
(Slack, Shopify, GitHub, Resend) do not let an integration stuff a `workspaceId` into the
payload, and the normalization rules differ per provider. The agreed direction is a more
powerful tier: **logic functions scoped at the application-registration / instance level**,
running custom code with no workspace binding, able to extract metadata from arbitrary webhook
payloads and (later) map external identities to workspaces. This also unlocks instance-level
use cases such as shared crons.

## 2. Scope

**In scope (this design — "server logic functions"):**
- A new logic-function tier scoped to an `ApplicationRegistration` (instance level), running
  with **no workspace binding**.
- Two triggers: **server webhook** and **server cron**.
- Reuse of the existing drivers, driver factory, and bundle/layer machinery.
- An economic/accountability security model (see §9), in place of a code-review gate.

**Explicitly out of scope (deferred):**
- The **external-identity → workspaceId mapping store** (`registerWorkspaceExternalIdentity`,
  `externalIdentityNamespace` resolver). Deferred to a later, separate effort.
- **Cross-workspace acting.** In v1 a server function acts only within the owner workspace
  (§7). Dispatching into other tenants' workspaces depends on the deferred external-identity
  work.
- **Code review / approval workflow.** Removed from the design (see §9 for why).
- **Outbound network egress controls.** Accepted as a documented known gap (§9).
- Any change to workspace-scoped logic functions, the `route-trigger` (domain-resolved), or
  the drivers themselves.

## 3. Goals & non-goals

**Goals**
- Run custom, app-author-provided code at the instance level, triggered by a shared webhook
  endpoint or a shared cron, with no per-workspace installation required for execution.
- Reuse as much of the existing logic-function execution stack (drivers, factory, bundle,
  layer, throttler, logging/usage plumbing) as possible.
- Leave the workspace-scoped logic-function path provably unchanged.
- Make instance compute non-free and fully attributable, neutralizing the "free compute for
  anyone" risk.

**Non-goals**
- A general multi-tenant fan-out (one webhook → write into many tenant workspaces). v1 is
  owner-workspace-scoped.
- A human moderation / code-review pipeline.

## 4. Foundational decision (chosen)

**Approach 1 — new core-scoped registry entity + thin delegating executor.** A new
`ApplicationRegistrationLogicFunctionEntity` in the `core` schema, keyed by
`applicationRegistrationId` (no `workspaceId`), mirroring the existing
`ApplicationRegistrationVariableEntity` precedent. It is a thin **registry/router**, not a
build target. A new thin `ServerLogicFunctionExecutorService` **delegates to the existing
`LogicFunctionExecutorService`** with the owner workspace as the execution context (§7) — so
owner credentials, server variables, the sandbox, and owner billing are all reused, with no
workspace-free build or driver code.

Why delegate rather than build at the registration level: minting the owner-scoped app token
(and billing the owner) requires the app to be **installed in the owner workspace**, which is
also the "no owner ⇒ no run" gate. The app is therefore always installed there, and its logic
functions are already built (bundle + dependency layer) in that workspace — so a separate
workspace-free build would be redundant *and* substantial new infrastructure (the local
driver's resource paths and layers are all workspace-keyed).

Rejected: making `LogicFunctionEntity.workspaceId` nullable (high blast radius on the most
workspace-coupled entity); manifest-only execution (reinvents the entity as denormalized JSON);
a full workspace-free build/executor clone (redundant given the owner-workspace install).

## 5. Data model & shared types

### 5.1 New entity: `ApplicationRegistrationLogicFunctionEntity`

A thin instance-level **registry/router** — not a build target. Execution reuses the
owner-workspace build via the existing executor (§7). The entity earns its place because the
cron tick needs an indexed table to query, and `disabledAt` (kill switch) cannot live in the
manifest (the manifest is replaced on every publish).

- `@Entity({ name: 'applicationRegistrationLogicFunction', schema: 'core' })`
- Keyed by `applicationRegistrationId` (`@ManyToOne ApplicationRegistrationEntity`, CASCADE
  delete). **No `workspaceId`.**
- Columns:
  - Identity: `id` (uuid PK), `universalIdentifier` (uuid), `name`.
  - Triggers (JSONB, nullable): `serverWebhookTriggerSettings`, `serverCronTriggerSettings`.
  - Safety: `disabledAt` (nullable timestamp — kill switch).
  - FK: `applicationRegistrationId` (uuid).
  - Timestamps: `createdAt`, `updatedAt`, `deletedAt` (soft delete).
- Unique index `(applicationRegistrationId, universalIdentifier)`.
- **No** execution/build columns (no `builtHandlerPath`/`handlerName`/`runtime`/`checksum`/
  `timeoutSeconds`/`layerId`) — the owner-workspace `LogicFunctionEntity` copy carries those.
- **No** review/approval columns, **no** source storage.

A migration (instance command) creates the table.

### 5.2 Shared types (`twenty-shared/src/application`)

- **`ServerCronTriggerSettings = { pattern: string }`** — identical to `CronTriggerSettings`.
- **`ServerWebhookTriggerSettings`** is redefined to mirror `HttpRouteTriggerSettings` minus
  `path` / `httpMethod` / `isAuthRequired`:
  ```ts
  export type ServerWebhookTriggerSettings = {
    forwardedRequestHeaders?: string[];
  };
  ```
  The previous `workspaceIdResolver` field is **removed** — custom code now does extraction.
  (`WebhookWorkspaceIdSource` and the resolver type are removed.)
- `LogicFunctionManifest` gains a way to mark an entry as server-scoped. Add a discriminator
  `scope?: 'workspace' | 'server'` (default `'workspace'`), plus the optional
  `serverCronTriggerSettings`. A `scope: 'server'` entry uses `serverWebhookTriggerSettings`
  and/or `serverCronTriggerSettings`; a `scope: 'workspace'` entry behaves exactly as today.
- **Forced server-function return contract:**
  ```ts
  export type ServerLogicFunctionResult = {
    workspaceIds: string[];
    response?: RouteTriggerResponse;
  };
  ```
  Every server function MUST return this shape. `workspaceIds` is always required (the set of
  workspaces the function resolved/acted on — see §7/§9 for how it is used); for a cron it may
  be `[]`. `response` is optional and only meaningful for the webhook trigger: it lets the
  function return a payload-derived HTTP status/body to the provider (e.g. the Slack
  `url_verification` challenge echo, Twilio TwiML, or a `401` on a failed signature check).
  The executor validates the returned shape; a non-conforming return is treated as a user
  error.

## 6. Sync lifecycle (registration level) — no build

Server functions are **not** built at the registration level. They are built like any other
function when the app is installed in the owner workspace (a hard requirement — §7), so the
registration tier only needs to maintain a registry of which functions are server-scoped.

New `ApplicationRegistrationLogicFunctionSyncService`, invoked from the existing manifest hook
point (`ApplicationRegistrationService.upsertFromCatalog` / `updateFromManifest`, beside the
existing `syncVariableSchemas` call):
- Diff `manifest.logicFunctions` where `scope === 'server'`: upsert
  `ApplicationRegistrationLogicFunctionEntity` rows (universalIdentifier, name, server trigger
  settings).
- Soft-delete rows whose manifest entry disappeared.
- No bundle build, no checksum, no layer — execution reuses the owner-workspace copy.

## 7. Execution path — `ServerLogicFunctionExecutorService`

A thin orchestrator that **delegates to the existing `LogicFunctionExecutorService`** with the
owner workspace as the execution context. This reuses owner credentials, server variables, the
sandbox, and owner billing for free — no workspace-free build or driver code. Steps:

1. **Eligibility gate:** the parent `ApplicationRegistration` must have a non-null
   `ownerWorkspaceId`, the server function's `disabledAt` must be null, and the instance config
   var (§9) must be enabled. Otherwise refuse (no owner ⇒ no run — the core anti-free-compute
   invariant).
2. **Resolve owner-workspace targets:** find the `ApplicationEntity` for
   `{ applicationRegistrationId, workspaceId: ownerWorkspaceId }` (the app must be installed in
   the owner workspace), then the owner-workspace `LogicFunctionEntity` copy for
   `{ workspaceId: ownerWorkspaceId, applicationId, universalIdentifier }`. If either is
   missing, refuse (app not installed in owner workspace).
3. **Throttle:** per-`applicationRegistrationId` token-bucket via `throttlerService` (key
   `` `${applicationRegistrationId}-server-logic-function-execution` ``), mirroring the
   existing per-workspace throttle.
4. **Build event:** `buildLogicFunctionEvent({ request, pathParameters: {},
   forwardedRequestHeaders, userWorkspaceId: null })` (webhook) or a minimal cron payload.
5. **Delegate:** `logicFunctionExecutorService.execute({ logicFunctionId: ownerCopy.id,
   workspaceId: ownerWorkspaceId, payload: event })`. This composes owner credentials + server
   variables, runs the driver with the function's own `timeoutSeconds` (no special cap), and
   **bills 100 credits to the owner workspace automatically**.
6. **Validate return:** the function must return `ServerLogicFunctionResult`
   (`{ workspaceIds: string[]; response? }`, §5.2); a non-conforming return is a user error.
7. **Record:** the returned `workspaceIds` are recorded/audit-logged and surfaced for the
   owner's own downstream re-billing; in v1 they are never used by core for acting (no
   cross-workspace acting) or for billing (billing is always the owner workspace, handled by
   the delegated executor).

## 8. Triggers

### 8.1 Server webhook (rework existing)

`server-webhook-trigger.service` is reworked to:
- Look up the `ApplicationRegistration` by `universalIdentifier` (unchanged).
- Look up the **`ApplicationRegistrationLogicFunctionEntity`** (not the workspace copy) by
  `universalIdentifier`, requiring `serverWebhookTriggerSettings`.
- Run it via `ServerLogicFunctionExecutorService`, passing the raw request as the event
  (custom code performs payload parsing + any workspace mapping; signature verification stays
  in the function, which receives `rawBody` + forwarded headers).
- Respond to the provider from the returned `ServerLogicFunctionResult`: if `response` is
  present, send it via the existing response builder (covers the Slack `url_verification`
  challenge echo, Twilio TwiML, signature-failure status, etc.); otherwise ack `200`. A thrown
  error maps to a `4xx`/`5xx` via the exception filter. The controller stays provider-agnostic
  — no per-provider special-casing.

The declarative `workspaceIdResolver` path is removed (subsumed by custom code).

### 8.2 Server cron (new)

Mirror the existing workspace-cron design, which is **a single global one-minute tick** (not
one BullMQ job per function). Add a `ServerCronTriggerCronJob` (`@Processor(cronQueue)`) +
`ServerCronTriggerCronCommand` (registered once at boot via `cron:register:all`). Each tick:
- Query `ApplicationRegistrationLogicFunctionEntity` rows that have `serverCronTriggerSettings`,
  are not soft-deleted, have `disabledAt == null`, and whose registration has a non-null
  `ownerWorkspaceId`.
- For each, `shouldRunNow(pattern, now)`; if due, enqueue a server-execution job that calls
  `ServerLogicFunctionExecutorService`.

The kill switch and "no owner" gate are simply filters in the tick query — no per-job teardown.
A server cron returns the same `ServerLogicFunctionResult` (`workspaceIds` is the set it
determined relevant, possibly `[]`; `response` is ignored — no caller). Billing is the owner
workspace (via the delegated executor).

## 9. Security model

Server functions run author-provided code at the instance level. The model relies on
accountability and economics rather than a code-review gate.

**Primary control — always-bill-owner + no-owner-no-run.** Every execution is billed to the
registration's owner workspace (a real, identified, billable account). A registration with
`ownerWorkspaceId == null` cannot execute server functions and cannot be listed in the
marketplace. This removes the "free compute for anyone" incentive at the root: an abuser pays
full freight for their own abuse.

**Supporting controls:**
- **Credential scoping (most important after billing):** the function has only the app's role
  within the owner workspace. It cannot read other tenants' data, so data exfiltration is
  bounded to the owner's own workspace.
- **Same sandbox as today:** server functions run in the existing forked-process / Lambda
  sandbox. They add no new code-execution-escape surface beyond the workspace logic functions
  already executed with arbitrary code + network access. The only genuinely new dimension —
  "no workspace" — is closed by requiring + billing an owner workspace.
- **Per-registration rate limit + concurrency cap:** bounds DoS / amplification.
- **Kill switch (`disabledAt`):** instance admin can instantly stop a registration's server
  functions, independent of any other state.
- **Execution audit log:** registration, function, duration, outcome, trigger source, returned
  `workspaceIds`; for detection and forensics.
- **Instance config-var gate:** the whole feature is gated by a boolean config var
  (`IS_SERVER_LOGIC_FUNCTION_ENABLED`), read via `TwentyConfigService` — *not* `FeatureFlagService`,
  which requires a `workspaceId` and so cannot gate a no-workspace path.
- **Marketplace listing requires `ownerWorkspaceId`.**

**Accepted known gap — outbound network egress.** A *paying* attacker could still use the
instance's network/IP to attack or spam third parties; billing does not prevent this and there
is no code review to catch it. This risk class already exists for ordinary workspace logic
functions, so server functions do not introduce a new class. Accepted and documented for v1;
the future lever is an outbound-domain allowlist.

## 10. Preserved (untouched)

`LogicFunctionEntity`, `LogicFunctionExecutorService`, `LogicFunctionTriggerService`, the
`route-trigger` (domain-resolved workspace functions), and all three drivers
(`disabled` / `local` / `lambda`) are unchanged. The server tier is a parallel instance-level
lane beside them.

## 11. Phased follow-up PRs

1. **Shared types + entity + migration.** `scope` discriminator, redefined
   `ServerWebhookTriggerSettings`, new `ServerCronTriggerSettings`, new
   `ServerLogicFunctionResult` return contract, `ApplicationRegistrationLogicFunctionEntity`
   (registry only), instance command migration, `IS_SERVER_LOGIC_FUNCTION_ENABLED` config var.
2. **Registration-level sync** (§6) — `ApplicationRegistrationLogicFunctionSyncService` wired
   into the manifest hook (no build).
3. **`ServerLogicFunctionExecutorService`** (§7) — eligibility gate, owner-target resolution,
   throttle, delegation to the existing executor, return-contract validation, audit log.
4. **Server webhook trigger rework** (§8.1).
5. **Server cron trigger** (§8.2) — global tick.
6. **Marketplace listing guard** (`ownerWorkspaceId` required) + kill-switch admin toggle.

## 12. Decision log (resolved questions)

- Execution model: **full instance-level function, no workspace binding** at the trigger
  surface; **executed in the owner-workspace context** by delegating to the existing executor.
- Storage: **Approach 1**, new core entity mirroring `applicationRegistrationVariable`, used as
  a thin **registry/router** (no build columns); execution reuses the owner-workspace build.
- Triggers: **webhook + cron.**
- Code review gate: **removed** — replaced by always-bill-owner accountability.
- Timeout: **no special hard cap** (uses `timeoutSeconds`).
- Return type: **forced** `ServerLogicFunctionResult` = `{ workspaceIds: string[]; response? }`.
  `workspaceIds` required (works for both webhook and cron); optional `response` lets a webhook
  function return a payload-derived HTTP status/body to the provider.
- Source storage: **none** (built artifacts only).
- Billing: **always bill owner workspace**; owner re-bills end customers out-of-core.
- v1 boundary: **owner-workspace context only**; cross-tenant dispatch deferred.
- Egress risk: **accepted & documented.**
- Trigger setting shapes: `ServerCron = { pattern }`, `ServerWebhook = { forwardedRequestHeaders? }`.

## 13. Deferred (separate efforts)

- External-identity → workspaceId mapping store and `externalIdentityNamespace` resolver.
- Cross-workspace acting / multi-tenant fan-out.
- Outbound network egress allowlist.
- JSONPath / JMESPath helpers (now moot for resolution, but possibly useful inside functions).
