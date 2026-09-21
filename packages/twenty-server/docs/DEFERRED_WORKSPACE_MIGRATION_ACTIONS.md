# Deferred Workspace Migration Actions

## Problem

A workspace migration (object, field and index changes from the settings UI, the metadata API or an application install) runs every action in a single Postgres transaction. Some parts of some actions are slow or have nothing to do with the transaction:

- Every new object adds a `target<Object>Id` join column to `timelineActivity`, `attachment`, `noteTarget` and `taskTarget`, and each gets a blocking `CREATE INDEX` that scans the whole table while the `ADD COLUMN` lock is held. On a self-hosted instance with 15M `timelineActivity` rows each new object cost minutes, an application install with dozens of objects took hours, hit the 10s query timeout and rolled back.
- Deleting a logic function also deletes its files from storage and its runtime resource. These run after the commit as in-process fire-and-forget closures (`afterCommitSideEffects`): a failure is logged and forgotten.

Both are the same thing: the part of a migration action that runs outside the migration transaction. This document introduces one mechanism for it.

## Principles

- **Metadata storage is the source of truth.** Decisions are taken from metadata and from `core.deferredWorkspaceMigrationAction`, never by inspecting `information_schema`, `pg_index` or `pg_class`.
- **A deferred action is persisted in the migration transaction.** The migration either commits with its deferred work recorded or rolls back without it. Nothing is lost if the process dies after the commit.
- **Correctness stays inline, cost moves out.** Unique indexes and foreign key enforcement stay in the transaction.
- **Same orchestration as the runner.** Deferred work is executed by the action handler that produced it, found through the same registry, so adding a new deferrable action means implementing one method on an existing handler.
- **Behind `IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED`**, a workspace feature flag, off by default. With the flag off, behavior is unchanged.

## Design

### Deferrable actions

`DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS` lists the action handler keys (`<actionType>_<metadataName>`, the same key the runner registry uses) that may defer part of their work, with the payload each one stores:

| Action | Deferred work | Payload |
| --- | --- | --- |
| `create_index` | `CREATE INDEX CONCURRENTLY` for a non-unique join column index on a table that existed before the migration | `{ indexMetadataId }`, a reference: the index metadata still exists after the commit |
| `delete_logicFunction` | delete the source folder and built handler from storage, delete the runtime resource | `{ flatLogicFunction }`, a snapshot: the metadata is gone after the commit |

The payload type is keyed by action, so a handler can only produce the payload of its own action and only listed actions can produce one.

### Action handler contract

`BaseWorkspaceMigrationRunnerActionHandlerService` gets two methods next to `executeForMetadata` and `executeForWorkspaceSchema`:

- `getDeferredActionPayload(context)` returns the payload when this action instance defers work, `undefined` otherwise (default). The handler owns the decision (for `create_index`: flag on, not unique, not partial, join columns only, object not created in the same migration) and skips the matching inline work.
- `executeDeferredAction({ workspaceId, applicationUniversalIdentifier, payload, attempt, queryRunner })` performs the deferred work. It runs outside any transaction, must be idempotent, and treats metadata that no longer exists as an obsolete action rather than a failure.

`execute()` returns `deferredActions` next to `partialOptimisticCache` and `metadataEvents`. `afterCommitSideEffects` is removed.

### Runner

After the action loop, the runner looks at the collected deferred actions:

- **Flag on:** it inserts them into `core.deferredWorkspaceMigrationAction` inside the migration transaction, commits, then enqueues `RunDeferredWorkspaceMigrationActionsJob` for the workspace.
- **Flag off:** only actions that were deferred before this mechanism exist (the logic function cleanup, since `create_index` does not defer without the flag). The runner executes them in-process right after the commit, which is today's behavior.

### Storage: `core.deferredWorkspaceMigrationAction`

| Column | Purpose |
| --- | --- |
| `workspaceId` | owning workspace, `ON DELETE CASCADE` |
| `applicationUniversalIdentifier` | application of the migration, passed back to the handler |
| `actionHandlerKey` | one of the deferrable actions, used to find the handler |
| `payload` | `jsonb`, the handler payload |
| `status` | `PENDING`, `IN_PROGRESS` or `FAILED` |
| `attempts`, `lastError`, `startedAt` | retry bookkeeping |

A row is deleted once its action succeeds.

### Execution: `DeferredWorkspaceMigrationActionRunnerService`

`RunDeferredWorkspaceMigrationActionsJob` runs on the workspace queue, deduplicated per workspace, with retries and exponential backoff. The runner service:

1. loads the workspace's `PENDING` rows once (actions created later come with their own job),
2. for each row, claims it with a conditional update (`PENDING` to `IN_PROGRESS`, `attempts + 1`),
3. resolves the handler from the registry with `actionHandlerKey` and calls `executeDeferredAction` on a dedicated connection without the 10s client query timeout and with a server-side `statement_timeout`, so a stuck statement is cancelled by Postgres,
4. deletes the row on success, or sets it back to `PENDING` (or `FAILED` after the last attempt) with `lastError`, then moves on to the next row,
5. fails the job at the end if any action failed, so the queue retries it.

`create_index` drops a possibly invalid leftover with `DROP INDEX CONCURRENTLY IF EXISTS` on a retry (`attempt > 1`) before rebuilding.

## Delivery plan

Each PR is merged on its own, everything stays behind the feature flag until the rollout PR.

| PR | Scope |
| --- | --- |
| 1 (this one) | `deferredWorkspaceMigrationAction` table, `DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS`, handler contract, runner persistence, deferred action runner and job with retries and timeout. `create_index` defers join column indexes, `delete_logicFunction` moves its storage and runtime cleanup from `afterCommitSideEffects` to a deferred action, and `afterCommitSideEffects` is removed. |
| 2 | Recovery: sweeper cron that resets `IN_PROGRESS` rows past the timeout and re-enqueues workspaces with `PENDING` rows; retry of `FAILED` rows (admin mutation and CLI command); metrics on pending, failed and duration. |
| 3 | Workspace migration lock: `schemaMigrationStatus` (`IDLE` or `MIGRATING`) and `schemaMigrationStartedAt` on `core.workspace`, taken with a conditional update before a migration touching objects, fields or indexes and released in `finally` (with a takeover timeout). While taken, or while the workspace has pending deferred actions that affect the schema (`create_index`, not `delete_logicFunction`), such migrations fail with `SCHEMA_MIGRATION_IN_PROGRESS` or `DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS`. `FAILED` rows do not block. |
| 4 | Error surfacing: runner codes sent as `subCode` (today `extensions.code` is overwritten by the GraphQL error code), object and field exception handlers map the new codes to `ConflictError`, the front shows a dedicated message with the pending count, the SDK CLI reads `subCode` and `userFriendlyMessage` and prints a retry hint. |
| 5 | Foreign keys: `ADD CONSTRAINT ... NOT VALID` for join columns created in the same action, plus a deferrable `create_fieldMetadata` action running `VALIDATE CONSTRAINT` with the constraint name stored in its payload. |
| 6 | Rollout: enable the flag for the affected self-hosted workspace, then for cloud workspaces, then turn it on by default and remove the flag. |

Out of scope for now: unique indexes, enum migrations, index updates (drop and rebuild), search vector rebuilds. Each can become a deferrable action later with the same contract.

## Known limitations until PR 2 and PR 3 land

- A worker crash during an action leaves the row `IN_PROGRESS` until the sweeper exists.
- `FAILED` rows need a manual reset to `PENDING`.
- Metadata changes are not blocked while actions are pending. A `create_index` whose index was deleted in the meantime is completed as obsolete, but a deletion racing an in-flight build can leave a physical index without metadata.
