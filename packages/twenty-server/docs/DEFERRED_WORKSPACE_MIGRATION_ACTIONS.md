# Deferred workspace migration actions

Implementation: [twentyhq/twenty#26222](https://github.com/twentyhq/twenty/pull/26222) (PR 1 of 6, merged), [twentyhq/twenty#26371](https://github.com/twentyhq/twenty/pull/26371) (PR 2, recovery), behind a feature flag. In-repo copy: `packages/twenty-server/docs/DEFERRED_WORKSPACE_MIGRATION_ACTIONS.md`.

## Problem

Data model changes (settings UI, metadata API, application installs) become unusable on workspaces with large tables. A self-hosted customer with 15M `timelineActivity` rows saw each new object cost about 6 minutes; an application install with dozens of objects was estimated at 7 hours, hit the query timeout and rolled back while the application version bump survived. Their workaround is to empty `timelineActivity` before every deployment. Cloud runs the same code path; 23 cloud workspaces had more than 1M `timelineActivity` rows (up to 17.9M) before they were trimmed on 2026-09-19, so they would pay the same cost on a slower disk.

## Context

A workspace migration runs every action in one Postgres transaction: `WorkspaceMigrationRunnerService.executeRun` opens it (`workspace-migration-runner.service.ts:349`), sets `lock_timeout = 8s` (`:365`) and commits once after the whole action loop (`:427`). Each action handler runs two steps inside that transaction, `executeForMetadata` and `executeForWorkspaceSchema` (`workspace-migration-runner-action-handler-service.interface.ts`).

Every new object gets system relations: a `target<Object>Id` join column on `timelineActivity`, `attachment`, `noteTarget` and `taskTarget` (`build-system-relation-flat-field-metadatas-for-object.util.ts`). For each one the runner issues, in the same transaction:

1. `ADD COLUMN`: instant, but takes an `ACCESS EXCLUSIVE` lock held until commit, blocking every read and write on that table for the rest of the migration;
2. `ADD CONSTRAINT ... FOREIGN KEY` (`create-field-action-handler.service.ts:274`), which scans the whole table to validate a column that is `NULL` on every row;
3. a blocking `CREATE INDEX` (`create-index-action-handler.service.ts`), which scans and sorts the whole table again.

The cost is two full table scans per new object, proportional to table size rather than to the size of the change. The runner uses the core datasource, whose client-side `query_timeout` defaults to 10s (`core.datasource.ts:81`); a timed-out query keeps running on the server while holding its locks.

The runner already has one mechanism for work outside the transaction: `afterCommitSideEffects` (introduced in #21845). Its only user is `DeleteLogicFunctionActionHandlerService`, which deletes a logic function's storage files and runtime resource after commit as in-process closures; a failure is logged and forgotten (`workspace-migration-runner.service.ts:545` on main). The #21845 description already anticipated moving this to "jobs and metadata boolean state tracker in db".

## Goals and non-goals

Goals:

- Move the slow, non-correctness-critical part of selected migration actions out of the migration transaction, starting with join column index creation.
- Make that deferred work durable: recorded in the same transaction as the metadata, retried, observable.
- One mechanism for all post-transaction work, replacing `afterCommitSideEffects`.
- Same orchestration as the runner: deferred work is executed by the action handler that produced it, found through the same registry.

Non-goals (this doc and PR 1):

- Unique indexes, enum migrations, index updates (drop and rebuild), search vector rebuilds. Each can become a deferrable action later with the same contract.
- Surfacing the blocked state to users through the API and the front end (PR 4 below).

## Design

### Principles

- **Metadata storage is the source of truth.** Decisions come from metadata and from the deferred action table, never from `information_schema`, `pg_index` or `pg_class`.
- **Deferred work is persisted in the migration transaction.** The migration either commits with its deferred work recorded or rolls back without it.
- **Correctness stays inline, cost moves out.** Unique indexes and foreign key enforcement stay in the transaction.
- **Behind `IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED`**, a workspace feature flag, off by default. With the flag off, behavior is unchanged.

### Deferrable actions

`DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS` lists the action handler keys (`<actionType>_<metadataName>`, the key the runner registry already uses) that may defer work. Each declares its payload type; adding a key without a payload fails to compile.

| Action | Deferred work | Payload |
| --- | --- | --- |
| `create_index` | `CREATE INDEX CONCURRENTLY` for a non-unique, non-partial index covering only `MANY_TO_ONE` join columns | `{ indexMetadataId }`, a reference: the index metadata still exists after commit |
| `delete_logicFunction` | delete the source folder and built handler from storage, delete the runtime resource | `{ flatLogicFunction }`, a snapshot: the metadata is gone after commit |

### Action handler contract

`BaseWorkspaceMigrationRunnerActionHandlerService` gets two methods next to `executeForMetadata` and `executeForWorkspaceSchema`:

- `getDeferredAction(context)` returns the deferred action of this action instance, typed so a handler can only return its own key, or `undefined` (default). The handler owns the decision and skips the matching inline work. `create_index` defers only when `IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED` is on in the `featureFlagsMap` the runner passes in the context; `delete_logicFunction` always returns its cleanup.
- `executeDeferredAction({ workspaceId, applicationUniversalIdentifier, payload, allFlatEntityMaps, attempt, queryRunner })` performs the deferred work outside any transaction. Like transactional actions, it receives the flat entity maps it needs and never reads or recomputes the workspace cache itself. It must be idempotent and treats metadata that no longer exists as an obsolete action rather than a failure.

`execute()` returns `deferredActions` next to `partialOptimisticCache` and `metadataEvents`. `afterCommitSideEffects` is removed.

### Runner

```mermaid
sequenceDiagram
    participant Client
    participant Runner as WorkspaceMigrationRunnerService
    participant Handler as Action handler
    participant DB as Postgres (core + workspace schema)
    participant Queue as workspaceQueue
    participant Worker as DeferredWorkspaceMigrationActionRunnerService

    Client->>Runner: run(workspaceMigration)
    Runner->>DB: BEGIN
    loop each action
        Runner->>Handler: execute(context)
        Handler->>DB: metadata rows + inline DDL (deferred part skipped)
        Handler-->>Runner: deferredActions
    end
    Runner->>DB: INSERT core.deferredWorkspaceMigrationAction (flag on)
    Runner->>DB: COMMIT
    Runner->>Queue: RunDeferredWorkspaceMigrationActionsJob (one per workspace)
    Runner-->>Client: success
    Queue->>Worker: runPendingActions(workspaceId)
    loop each PENDING row
        Worker->>DB: claim (PENDING to IN_PROGRESS)
        Worker->>Handler: executeDeferredAction(payload) via registry
        Handler->>DB: CREATE INDEX CONCURRENTLY / storage cleanup
        Worker->>DB: delete row, or back to PENDING / FAILED
    end
```

The runner delegates both steps to `DeferredWorkspaceMigrationActionRunnerService`:

- **Flag on:** `persist` inserts the collected deferred actions inside the migration transaction (`workspace-migration-runner.service.ts:417`), and after commit `dispatchAfterCommit` (`:556`) enqueues one job for the workspace.
- **Flag off:** nothing is persisted. `create_index` does not defer, so only the logic function cleanup produces a deferred action, and `dispatchAfterCommit` executes it in process right after commit, which is the previous `afterCommitSideEffects` behavior.

### Storage: `core.deferredWorkspaceMigrationAction`

| Column | Purpose |
| --- | --- |
| `workspaceId` | owning workspace, `ON DELETE CASCADE` |
| `applicationUniversalIdentifier` | application of the migration, passed back to the handler |
| `actionHandlerKey` | one of the deferrable actions, used to find the handler |
| `payload` | `jsonb`, the handler payload |
| `position` | order of the action within its migration |
| `runByVersion` | `APP_VERSION` of the server that ran the migration |
| `status` | `PENDING`, `IN_PROGRESS` or `FAILED` |
| `attempts`, `lastError`, `startedAt` | retry bookkeeping |

Index on `(workspaceId, status)`. A row is deleted once its action succeeds. The table is not part of the flat entity maps or the migration builder.

### Execution

`RunDeferredWorkspaceMigrationActionsJob` runs on `workspaceQueue` with 3 attempts and an exponential backoff starting at 30 seconds. It is deduplicated per workspace with BullMQ `deduplication` and `keepLastIfActive`: a job enqueued while another one runs for the same workspace waits for it, since two concurrent runs would each skip the rows the other claimed and break the ordering. `DeferredWorkspaceMigrationActionRunnerService.runPendingActions`:

1. loads the workspace's `PENDING` rows once, ordered by creation then `position` (actions created later come with their own job);
2. claims each row with a conditional update (`PENDING` to `IN_PROGRESS`, `attempts + 1`);
3. resolves the handler with `actionHandlerKey` (`executeDeferredActionHandler`, registry `:118`) and calls `executeDeferredAction` with the flat entity maps loaded once per run through `WorkspaceManyOrAllFlatEntityMapsCacheService`, for the same metadata names the migration runner would load (`getMetadataNamesToLoadForWorkspaceMigration`), on a dedicated connection without the client `query_timeout` and with a server-side `statement_timeout` of one hour, so Postgres cancels a stuck statement itself;
4. deletes the row on success, or sets it back to `PENDING` (`FAILED` after the last attempt) with `lastError`, both scoped to the claim it took (`IN_PROGRESS` with its own attempt number) so a worker resuming after its row was recovered cannot overwrite the newer run;
5. stops at the first failure and fails the job, so the queue retries it and the remaining actions keep running in order.

`create_index` reads the index from the maps it receives and completes as obsolete if it is absent. The maps are fresh because the runner invalidates the cache after commit, before enqueueing the job. On a retry it runs `DROP INDEX CONCURRENTLY IF EXISTS` first, since a failed concurrent build leaves an invalid index behind.

Each execution records `deferred-workspace-migration-action/duration-ms` with `actionHandlerKey` and `status`, and `twenty_deferred_workspace_migration_actions` gauges the rows by status across workspaces.

### Recovery

`DeferredWorkspaceMigrationActionRecoveryService`, driven by `DeferredWorkspaceMigrationActionRecoveryCronJob`, runs every 10 minutes (`cron:deferred-workspace-migration-action-recovery`, registered by `cron:register:all`):

1. an `IN_PROGRESS` row started more than the statement timeout plus 15 minutes ago belongs to a worker that died mid-run, since Postgres has cancelled its statement by then; it goes back to `PENDING`, or to `FAILED` if it used its last attempt;
2. every workspace with `PENDING` rows is enqueued, which covers lost enqueues and the actions left behind a failure once the job ran out of attempts.

`workspace:retry-failed-deferred-migration-actions [-w <workspaceId>]` resets `FAILED` rows to `PENDING` with no attempts, for one workspace or all of them, and enqueues them.

### Guarding migrations against in-flight builds

A migration and a concurrent index build on the same table deadlock: Postgres cancels one of them, and the loser can be the migration a user is waiting on. `InFlightDeferredWorkspaceMigrationActionsService`, called from `WorkspaceMigrationRunnerService.run` for workspaces with the flag on, refuses the migration with `DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS` while the workspace has `PENDING` or `IN_PROGRESS` rows for a deferred action that builds workspace schema objects.

`SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS` lists which ones those are, today `create_index` and not `delete_logicFunction`. `FAILED` rows do not block, since they need a manual retry and would otherwise freeze the data model.

The deferred action table is the whole state: an in-flight build is exactly a row in it, so nothing else has to be stored. Every migration is refused while such a row exists, including ones that only touch views or dashboards; the check is on what is already running, not on what the incoming migration does.

Two metadata migrations started at the same moment are not serialized by this, which is unchanged from today: they meet on the `ACCESS EXCLUSIVE` locks their DDL takes, and one of them hits the runner's 8 second `lock_timeout`.

## Alternatives considered

- **Keep deferred work on `afterCommitSideEffects`.** It is in-process and fire-and-forget: a crash after commit loses the work and leaves metadata describing an index that does not exist. Lost because the work must be durable.
- **Per-type state columns on `indexMetadata` / `fieldMetadata`.** Adding a column to a syncable entity touches the flat entity plumbing, cache codec and builder comparison in about 25 files, and changing `fieldMetadata` bumps the metadata version for every client. Lost to a dedicated table that also serves as the job's queue.
- **An index-specific `deferredSchemaOperation` table** (first iteration of the PR). It did not cover the logic function cleanup and required a separate orchestration next to the runner. Lost to one generic table keyed by action.
- **A size threshold (defer only above N rows via `pg_class.reltuples`).** Lost because it reads Postgres catalogs instead of metadata. Every eligible index is deferred instead, including indexes on tables created by the same migration, which the worker builds in milliseconds since those tables are empty.
- **Skip the index and keep only a partial `WHERE col IS NOT NULL` index inline.** A partial index still reads the whole table to build. Lost because it does not remove the scan.

## Rollout and testing

Delivery, each PR merged on its own behind the flag:

| PR | Scope |
| --- | --- |
| 1 | Table, `DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS`, handler contract, runner persistence, deferred action runner and job with retries and timeout; `create_index` and `delete_logicFunction`; `afterCommitSideEffects` removed. |
| 2 | Recovery: cron resetting `IN_PROGRESS` rows past the timeout and enqueueing workspaces with `PENDING` rows; CLI retry of `FAILED` rows; job deduplication per workspace and retry backoff; metrics on duration and on rows by status. |
| 3 | Refuse schema-affecting migrations while the workspace has in-flight deferred builds: see above. |
| 4 | Error surfacing and admin retry of `FAILED` rows from the admin panel: runner codes sent as `subCode` (today `extensions.code` is overwritten by the GraphQL error code), object and field exception handlers map the new codes to `ConflictError`, dedicated front message with the pending count, SDK CLI reads `subCode` and `userFriendlyMessage`. |
| 5 | Foreign keys: `ADD CONSTRAINT ... NOT VALID` for join columns created in the same action, plus a deferrable `create_fieldMetadata` action running `VALIDATE CONSTRAINT` with the constraint name in its payload. |
| 6 | Enable the flag for the affected self-hosted workspace, then cloud, then default on and remove the flag. |

Migration: one fast instance command in 2.42 creating the table. No backfill.

Tested in PR 1:

- unit: the deferral decision (unique, partial, non-relation, one-to-many side, mixed columns, unresolved field);
- integration, through the public APIs only: with the flag on, creating an object adds one join column index to each system relation object, records of the new object get timeline activities, and deleting a logic function succeeds; existing object, field, index and logic function suites pass;
- manual, 3M `timelineActivity` rows: flag off logic function deletion removes files right after commit; flag on persists actions with the worker stopped and processes them once started (`timelineActivity` index built in 2.4s outside the transaction); an object deleted before the worker ran completes its actions as obsolete; a broken column fails three times then `FAILED` while the other indexes build immediately; restoring it before a retry drops and rebuilds the index.

Tested in PR 2, manually on the same data: two object creations with the worker stopped queue a single job; with the enqueue removed and rows left `IN_PROGRESS` two hours ago, nothing runs until the cron resets them (one to `PENDING`, the one at its last attempt to `FAILED`) and enqueues the workspace; the retry command builds the `FAILED` index; a broken column is retried after 30 then 60 seconds, and the actions behind it run at the next cron once it is `FAILED`.

Tested in PR 3, manually on the same data: a second object creation is refused while the first one's index builds are pending, and accepted once they drain; a view creation is refused too; a pending logic function cleanup on its own refuses nothing; with the flag off nothing is refused. Integration: the deferred, index and object metadata suites pass.

Known limitation until PR 4: the refusal reaches the client as `INTERNAL_SERVER_ERROR` with the right `userFriendlyMessage`, because the GraphQL error code overwrites `extensions.code`.

## Open questions

1. **Should deferral be decided by the runner at step level instead of by each handler?** Today `create_index` defers its `executeForWorkspaceSchema` step while `delete_logicFunction` defers work that was never a runner step, each handler builds its own payload, and the handler has to remember to skip its own inline work. A more consistent shape: the runner skips the step for deferrable actions and persists the flat action itself (plus the pre-delete flat entity for deletes), and the worker replays the same step with a rebuilt context. Logic function cleanup would then need a real step, either (a) its currently empty `executeForWorkspaceSchema`, or (b) a new `executeForExternalResources` step that always runs after commit. Recommendation: runner-owned deferral with option (b), done in PR 1 before merge.
2. **Should logic function cleanup be durable for everyone now, not only behind the flag?** It is low risk and fixes silent orphans in storage. Recommendation: keep it behind the flag until PR 2 (recovery) lands.
3. **Should the one-hour statement timeout be a config variable?** Recommendation: constant for now, config variable if a self-hosted instance needs more.
