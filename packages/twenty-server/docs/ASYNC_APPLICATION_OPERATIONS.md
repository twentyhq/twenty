# Async application install / upgrade / uninstall — design

## Problem

`installApplication`, `upgradeApplication` and `uninstallApplication` run the whole operation inside the GraphQL mutation. An install fetches and extracts the package, writes files to storage, runs a pre-install hook, applies the manifest through the workspace-migration pipeline, and runs a post-install hook — third-party logic functions of arbitrary duration. Uninstall symmetrically runs the uninstall hook, builds and runs a full "diff against empty" workspace migration, and tears down runtime resources. The UI (and the CLI) block on the mutation for the whole time, and a slow hook holds an HTTP request open for minutes.

Goal: run these operations in queue jobs on the worker, persist an application lifecycle `state`, and push state changes to clients over the existing SSE broadcast channel.

## Prior attempt

[#24941](https://github.com/twentyhq/twenty/pull/24941) implemented the full feature in one PR: 97 files, +2905/−1199. It worked in the end but was closed as unreviewable ("Too large to review reliably") and went through many fix rounds because the server, realtime and UI concerns all landed at once. This design keeps its validated decisions (listed per PR below, marked *from #24941*) and splits the work into three independently shippable PRs:

1. **PR 1 — `state` column**, written by the current synchronous operations, surfaced read-only in the UI.
2. **PR 2 — realtime**: broadcast `application` and `applicationRegistration` changes over the existing SSE mechanism, consume them in the front.
3. **PR 3 — jobs**: mutations become enqueue-only; install/upgrade/uninstall run in worker jobs; CLI polls for the outcome.

Each PR is useful on its own: PR 1 gives a persisted lifecycle the DB and admin tooling can inspect, PR 2 makes every applications surface live-update (installs triggered by another user/tab/CLI already benefit), PR 3 flips the execution model without touching data shape or transport again.

## Ground rules (apply to every PR)

- **Simplicity first.** Prefer the smallest mechanism already present in the codebase over a new one. No new event channels, no new transports, no speculative states.
- **Test only what matters**: the state-transition logic, the enqueue-time validations, and the async outcome of the integration install/uninstall suites. Do not add snapshot or component tests for chips and labels.
- **Minimal comments.** Only WHY comments for non-obvious invariants (e.g. why a rollback is conditional), per house rules.
- **Follow existing standards**: `CLAUDE.md` house rules, `.cursor/rules/`, and the file-naming of the directory being edited. String-literal-style TS enums for GraphQL enums, `isDefined` guards, Lingui for user-facing strings, named exports, no `useEffect` where an event handler works.

---

## PR 1 — `state` column on `application`

### Data model

New column on `core.application`:

```ts
export enum ApplicationState {
  INSTALLING = 'INSTALLING',
  INSTALLED = 'INSTALLED',
  UPGRADING = 'UPGRADING',
  UNINSTALLING = 'UNINSTALLING',
}
```

- `text` column + TS enum + `registerEnumType`, not a native pg enum — adding a state later is a code-only change. Enum colocated in `application/enums/application-state.enum.ts` with its `registerEnumType`, mirroring `application-registration/enums/application-registration-source-type.enum.ts`.
- **No `FAILED` state** (*from #24941*): a failed fresh install rolls back and deletes the row; a failed upgrade or uninstall reverts to `INSTALLED`. The failure reason lives in server logs and the failed job. A `FAILED` state would need retry/cleanup UX we don't want yet.
- **Column default `'INSTALLED'`**, `NOT NULL`. This simplifies #24941's backfill-then-switch-default dance into nothing: existing rows get `INSTALLED` via the default at migration time, and every creation path that produces a ready-to-use row (twenty standard app, workspace-custom app, dev apps synced by the CLI watcher, bare OAuth installs) is correct without being touched. Only the managed install pipeline passes `INSTALLING` explicitly on create.

### Migration

One fast instance command in the current `TWENTY_CURRENT_VERSION` directory (`2-38` at time of writing), generated with:

```bash
npx nx run twenty-server:database:migrate:generate --name add-state-to-application --type fast
```

`up`: `ALTER TABLE "core"."application" ADD COLUMN IF NOT EXISTS "state" text NOT NULL DEFAULT 'INSTALLED'`; `down` drops it. Entity column gets `@WasIntroducedInUpgrade` naming the command. Template: `2-33-instance-command-fast-...-add-uninstall-hook-completed-for-requested-at-to-application.ts`.

### Server changes

- `ApplicationEntity.state` + DTO field (`@Field(() => ApplicationState)` on `ApplicationDTO`) + `from-flat-application-to-application-dto.util.ts`.
- `FlatApplication` includes `state` automatically (it is `Omit<ApplicationEntity, relations>`), which makes the compiler point at every literal to fix: `buildVirtualDryRunFlatApplication` in `application-sync.service.ts` and two flat-field-metadata specs.
- Synchronous operations write the state:
  - `ApplicationInstallService.runInstall`: fresh install creates the row with `state: INSTALLING` (in `ensureApplicationExists` → `applicationService.create`); upgrade sets `UPGRADING` at start; both set `INSTALLED` on success; upgrade failure reverts to `INSTALLED` (fresh-install failure already deletes the row).
  - `ApplicationSyncService.uninstallApplication`: sets `UNINSTALLING` before running the hook/migration; reverts to `INSTALLED` on failure (the success path deletes the row).
- No concurrency gating yet — the existing `app-install:` cache lock still serializes installs; atomic state-gated transitions arrive with the async mutations in PR 3, where they are actually needed.

### Frontend changes (read-only surfacing)

- Add `state` to `applicationFragment`, `findManyApplications`, `findOneApplicationByUniversalIdentifier`; regenerate metadata types (`npx nx run twenty-front:graphql:generate --configuration=metadata`) and client-SDK types.
- `SettingsApplicationTableRow`: render a state chip when `state !== INSTALLED`, next to the existing `Update` tag — `Status` from `twenty-ui/data-display` with `isLoaderVisible` (the `Importing`/`Evaluating` precedent).
- `SettingsApplicationDetailAboutTab.getActionButton`: when `state !== INSTALLED`, show the matching disabled label (`Installing...` / `Upgrading...` / `Uninstalling...`) from the persisted state instead of only the local `isInstalling`/`isUninstalling` booleans (keep those for the awaiting-mutation case — the mutations are still synchronous in this PR).
- Add `'state'` to `applicationWithoutRelation.ts`.

Since mutations are still synchronous, transitional states are mostly visible to *other* readers (another tab, admin tooling, a row left mid-state by a crash). That is fine — this PR is about plumbing the field end to end, not about live updates.

### Tests

- Unit: none needed beyond the fixed flat-application specs — the state writes are exercised by integration.
- Integration: existing install/uninstall suites assert `state === INSTALLED` after install and row absence after uninstall; one assertion that a failed upgrade leaves `INSTALLED`.

**Estimated size:** ~15 files.

---

## PR 2 — realtime `application` / `applicationRegistration` updates over SSE

### Transport: reuse `WorkspaceEventBroadcaster`, nothing new

The broadcast path already exists end to end:

- Server: `WorkspaceEventBroadcaster.broadcast({ workspaceId, events })` fans out to every active event stream of the workspace over Redis pub/sub → `graphql-sse`. Non-syncable core entities already use it: `agentChatThread` (create/update/delete, user-scoped) and `application` (the narrow `sdkClientCoreChecksum` update in `sdk-client-generation.service.ts`).
- Front: `useTriggerEventStreamCreation` → `dispatchMetadataEventsFromSseToBrowserEvents` → `window` CustomEvent → `useListenToMetadataOperationBrowserEvent` / `MetadataStoreSSEEffect`.

Metadata/broadcast events are delivered to every stream in the workspace unconditionally (only object-record events are query-gated), so no client-side subscription registration is needed.

### Server changes

- `ApplicationService.create` / `update` / `delete` broadcast `application` `created` / `updated` / `deleted` (*from #24941*). Best-effort: try/catch + `logger.warn`, as `broadcastSdkClientCoreChecksumUpdate` does — a broadcast failure never fails the operation.
- **Payloads always carry the full serialized row the front holds** (`serializeApplicationForBroadcast`: `id`, `universalIdentifier`, `name`, `state`, `version`, ...) — never a partial `after` (*from #24941*: a partial `after` replaced the stored application with a stub mid-install; also note `turnSseMetadataEventsToMetadataOperationBrowserEvents` silently drops create/update events without `properties.after`). Fold `broadcastSdkClientCoreChecksumUpdate` into the same serializer.
- `ApplicationRegistrationService` workspace-scoped mutations (`create`, `update`, `updateFromManifest`, `delete`, `setLatestAvailableVersionIfChanged`, ...) broadcast `applicationRegistration` events the same way, with a serialized summary payload matching what the front queries (`id`, `universalIdentifier`, `latestAvailableVersion`, `sourceType`, `name`, ...).
- **Known limitation, accepted:** cross-workspace registration mutations (`updateGlobal`, `upsertFromCatalog`, admin-panel resolvers) have no `workspaceId` to broadcast into — there is no cross-workspace fan-out primitive. Admin panel keeps refreshing on query. Do not build a new channel for this.

### Frontend changes

- Register both names in `ALL_NON_SYNCABLE_BROADCAST_ENTITY_NAME` (`browser-event/types/BroadcastEntityName.ts`; `application` is already there).
- **`applications` becomes a metadata-store entity** (*from #24941*), so `MetadataStoreSSEEffect` is the single listener — no bespoke SSE hook:
  - add `applications` to `ALL_METADATA_ENTITY_KEYS`, `MetadataEntityTypeMap` (a slim `FlatApplication`: `id`, `universalIdentifier`, `name`, `state`, `version`) and `mapAllMetadataNameToEntityKey`;
  - `ApplicationsInitializationEffect`, mounted once in `WorkspaceAppProviders`, seeds the entry from `FindManyApplications` when empty — the `agentChatThreads` / `AgentChatThreadInitializationEffect` precedent; SSE events maintain it from there;
  - SSE reconnection already resets and reseeds the store, which is the missed-events safety net.
- **`applicationRegistrations` stays out of the store.** Registrations are read on two pages (developer tab, registration detail) through Apollo; a store key would need its own Flat type, seeding effect and staleness story (there is no workspace-cache flat map for registrations, so no `updatedCollectionHash`). Instead: one small hook following the `useOnApplicationSdkClientChecksumsUpdated` pattern — listen for `applicationRegistration` browser events and update/refetch the relevant Apollo queries — mounted where registrations are displayed.
- Consumers switch to the store where it helps immediately:
  - `SettingsApplicationsInstalledTab` reads applications (and their `state` chips) from the store instead of a bare `useQuery`, so installs/uninstalls done elsewhere update the table live;
  - detail pages keep their Apollo queries for everything the store does not model (logos, roles, objects, connection providers) and refetch them when the stored row appears, reaches `INSTALLED`, or disappears (*from #24941*: broadcast events carry the row, never its relations — the Permissions/Settings tabs are gated on data attached after row creation, so a refetch on the terminal transition is required; gate on the terminal state to get one refetch per operation, not one per intermediate write).

### Tests

- Unit: the broadcast serializers (full-row invariant) and, on the front, `mapAllMetadataNameToEntityKey` coverage if a test already exists there — nothing else.
- Integration: one test asserting an install/update/uninstall emits the expected broadcast events (spy on `WorkspaceEventBroadcaster`).

**Estimated size:** ~20 files. Still synchronous execution — this PR must not change any mutation behavior.

---

## PR 3 — install / upgrade / uninstall jobs

### Jobs

Three jobs on `MessageQueue.workspaceQueue`, following the house pattern (`@Processor` class + `@Process` method, job name and payload type in a sibling `*.job-constants.ts`, registered in `jobs.module.ts` with the owning module imported):

- `InstallApplicationJob` — `{ applicationId, appRegistrationId, version?, workspaceId }` → `ApplicationInstallService`
- `UpgradeApplicationJob` — `{ applicationId, workspaceId }` → upgrade service
- `UninstallApplicationJob` — `{ applicationId, universalIdentifier, workspaceId }` → `ApplicationSyncService.uninstallApplication`

Notes:

- `workspaceQueue` runs at `concurrency: 1, lockDuration: 30_000`. The lock is renewed while the job is awaiting, so long installs are fine unless the event loop blocks; if installs prove to starve other workspace jobs, moving to a dedicated queue is a one-entry change in `message-queue-worker-config.constant.ts` (the `aiStreamQueue` long-job config is the precedent). Start on `workspaceQueue`; don't add a queue speculatively.
- Enqueue with `id: <jobName>-<workspaceId>-<universalIdentifier>` for waiting-job dedup, but do not rely on it for correctness — BullMQ dedup only covers *waiting* jobs. Correctness comes from state gating (below).
- `retryLimit: 0` for install/upgrade/uninstall: these are not idempotent and have their own rollback; a retry after a partial failure would run against rolled-back state. Failures are terminal and handled in the job's catch.

### Mutations become enqueue-only

`installApplication` / `upgradeApplication` / `uninstallApplication`:

1. **Fail fast at enqueue time** (*from #24941*) so common errors still surface synchronously on the mutation: registration existence, tarball ownership/listing availability, `canBeUninstalled`, synchronous version-progression check, and the concurrent-operation guard.
2. **Reserve the lifecycle atomically.** Every transition goes through `ApplicationService.transitionState`, a single conditional write: `UPDATE application SET state = $next WHERE id = $id AND state = $expected`, affected-rows-checked. The loser of a race gets a new `APPLICATION_OPERATION_IN_PROGRESS` exception code. Two concurrent *fresh* installs have no row to gate on; the partial unique index on `(universalIdentifier, workspaceId)` arbitrates and the losing insert maps to the same error. This must be atomic from the first commit — the read-then-check-then-update variant was #24941's main review finding.
3. Install pre-creates the row (`INSTALLING` placeholder from registration data) or flips an installed row to `UPGRADING`; uninstall flips to `UNINSTALLING`; then enqueue. **Enqueue failure compensates**: revert via `transitionStateBestEffort` (log, don't throw — a failed recovery must not mask the enqueue error) or delete the fresh placeholder. `installApplication` still returns the `Application` (now with a transitional `state`); `uninstallApplication` keeps returning `Boolean`.
4. Keep the existing `app-install:` cache lock inside the service as the execution-time serializer; state gating is the request-time arbiter.

Failure handling in jobs (same model as PR 1): failed fresh install → rollback deletes the placeholder (broadcasts `deleted`); failed upgrade/uninstall → revert to `INSTALLED`. Uninstall metrics move from the resolver into the job.

Direct service callers stay direct: auto-upgrade cron, pre-installed/onboarding app jobs, the CLI install command, workspace deletion — they already run in workers or CLI processes and now get consistent state transitions for free.

### Frontend

PR 2 already delivers the events; this PR only teaches the flows that the mutation no longer means "done":

- Marketplace install flow follows **the row the mutation named, by id**, via the store: navigate to the app when that row settles on `INSTALLED`, show a failure snackbar when the rolled-back install removes it. A row already `INSTALLED` when the install starts must be seen in a transitional state first (*from #24941*: following by `universalIdentifier` and navigating on the first `INSTALLED` read caused premature redirects).
- Detail page redirects to the applications list only when the store says the row is gone *and* the lookup answers `NOT_FOUND` — a transient error must not bounce the visitor.
- Buttons/chips are already state-driven from PR 1; remove the now-redundant local `isInstalling`-style booleans where the persisted state covers them.
- Drop the optimistic push into `currentWorkspaceState.installedApplications` on mutation resolve (the app is not installed yet); accept that app chips outside settings refresh on workspace reload, as today.

### CLI (`twenty-sdk`)

`app install` / `app uninstall` poll `findOneApplication` after the enqueue mutation (2s interval, 10min timeout): success on `INSTALLED` (with `version` matching the package's, so a reverted upgrade reads as failure) or row-gone for uninstall; failure on rollback/revert. A failed poll is recorded and polling continues to the deadline (*from #24941*).

### CI / tests

- CI workflows that install apps against a server-only stack (hello-world, postcard, sdk e2e, create-app minimal) must start a queue worker (`worker:ci` target) (*from #24941*).
- Integration test utils drain the queues after the mutation (the in-process test app runs the job workers), switching to real timers when jest fake timers are active (*from #24941*).
- Failing-install suites (workspace-version gate, manifest validation) assert the async outcome — installation rolled back — while suites covered by enqueue-time checks (version progression, registration not found) keep their synchronous error snapshots.
- Unit tests: `transitionState` gating (winner/loser), enqueue-failure compensation. Nothing else.

**Estimated size:** the biggest of the three, but bounded: jobs + resolver rework + `transitionState` + CLI polling + test utils, with no schema or transport changes.

---

## Explicit non-goals / follow-ups (do not fold into these PRs)

- **Stuck-state reconciliation**: a hard worker crash (not a thrown error) leaves a transitional state with no retry path. Needs a cron comparing `updatedAt` against per-state thresholds plus an admin force-reset. Own ticket.
- **Failure-reason surfacing**: row events cannot distinguish a rolled-back install from an uninstall; details stay in logs/failed jobs. Own ticket if wanted.
- **Cross-workspace realtime for the admin panel** (broadcasts are workspace-scoped).
- **`useTriggerEventStreamCreation` double-dispatch**: every SSE payload is processed twice (subscription sink + `message` listener). Idempotent consumers hide it; fix separately.
- Making `findOneApplication` nullable instead of throwing `NOT_FOUND` (breaking schema change).

## Key file references

| Concern | File |
|---|---|
| Install pipeline | `packages/twenty-server/src/engine/core-modules/application/application-install/application-install.service.ts` |
| Uninstall pipeline | `packages/twenty-server/src/engine/core-modules/application/application-manifest/application-sync.service.ts` (`uninstallApplication`) |
| Resolver | `packages/twenty-server/src/engine/core-modules/application/application-install/application-install.resolver.ts` |
| Entity / DTO | `.../application/application.entity.ts`, `.../application/dtos/application.dto.ts` |
| Broadcaster | `packages/twenty-server/src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service.ts` |
| Existing app broadcast | `packages/twenty-server/src/engine/core-modules/sdk-client/sdk-client-generation.service.ts` (`broadcastSdkClientCoreChecksumUpdate`) |
| Queue pattern | `packages/twenty-server/src/engine/core-modules/message-queue/` (`jobs.module.ts`, `message-queue-worker-config.constant.ts`), example: `workspace/jobs/workspace-deletion-application-uninstall.job.ts` |
| Instance command example | `packages/twenty-server/src/database/commands/upgrade-version-command/2-33/2-33-instance-command-fast-1787151824000-add-uninstall-hook-completed-for-requested-at-to-application.ts` |
| Front SSE → store | `packages/twenty-front/src/modules/sse-db-event/`, `src/modules/browser-event/types/BroadcastEntityName.ts`, `src/modules/metadata-store/effect-components/MetadataStoreSSEEffect.tsx`, `states/metadataStoreState.ts` |
| Store seeding precedent | `packages/twenty-front/src/modules/ai/components/AgentChatThreadInitializationEffect.tsx` |
| Install/uninstall UI | `packages/twenty-front/src/pages/settings/applications/` (`SettingsApplicationDetails.tsx`, `SettingsAvailableApplicationDetails.tsx`, `tabs/SettingsApplicationDetailAboutTab.tsx`, `components/SettingsApplicationTableRow.tsx`), `src/modules/marketplace/hooks/useInstallMarketplaceApp.ts` |
| In-progress chip precedent | `packages/twenty-ui/src/data-display/Status/Status.tsx` (`isLoaderVisible`) |
