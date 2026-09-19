# Deferred Schema Operations

## Problem

A workspace migration (object, field and index changes from the settings UI, the metadata API or an application install) runs in a single Postgres transaction. Every new object adds a `target<Object>Id` column to `timelineActivity`, `attachment`, `noteTarget` and `taskTarget`, and for each of them the runner issues:

1. `ADD COLUMN` (instant, but it takes an `ACCESS EXCLUSIVE` lock held until commit),
2. `ADD CONSTRAINT ... FOREIGN KEY`, which scans the whole table to validate a column that is `NULL` everywhere,
3. a blocking `CREATE INDEX`, which scans and sorts the whole table again.

The cost grows with the size of those tables, not with the size of the change. On a self-hosted instance with 15M `timelineActivity` rows each new object cost about 6 minutes, an application install with dozens of objects took hours, hit the 10s client-side query timeout and rolled back while the application version bump survived.

## Principles

- **Metadata storage is the source of truth.** Decisions are taken from metadata (`indexMetadata`, `fieldMetadata`, the migration actions) and from `core.deferredSchemaOperation`, never by inspecting `information_schema`, `pg_index`, `pg_constraint` or `pg_class`. Postgres is only used to execute the DDL.
- **Correctness stays inline, cost moves out.** Anything that enforces data correctness (unique indexes, foreign key enforcement on new writes) stays in the migration transaction. Work that only improves query performance, or re-checks rows that cannot be invalid, is deferred.
- **Everything ships behind `IS_DEFERRED_SCHEMA_OPERATIONS_ENABLED`**, a workspace feature flag, off by default.

## Design

### Pending state: `core.deferredSchemaOperation`

| Column | Purpose |
| --- | --- |
| `workspaceId` | owning workspace, `ON DELETE CASCADE` |
| `type` | `CREATE_INDEX` (later `VALIDATE_FOREIGN_KEY`) |
| `status` | `PENDING`, `IN_PROGRESS` or `FAILED` |
| `indexMetadataId` | the index to build, `ON DELETE CASCADE` so deleting the index (or its field or object) drops the operation |
| `attempts`, `lastError`, `startedAt` | retry bookkeeping |

A row is inserted in the same transaction as the metadata it belongs to and deleted once the operation succeeds. It is not part of the flat entity maps or the migration builder, so adding it does not touch syncable entity plumbing or the metadata cache.

### Runner option

`WorkspaceMigrationRunnerService.run` accepts `deferSchemaOperations`. When omitted it defaults to the workspace feature flag. The runner collects the objects created by the migration and passes them to the action handlers.

### What gets deferred

`CreateIndexActionHandlerService` defers an index when all of these hold:

- `deferSchemaOperations` is on,
- the index is not unique and not partial,
- every indexed field is the `MANY_TO_ONE` side of a relation or morph relation (a join column),
- the index's object is not created in the same migration (a new table is empty, building inline is instant).

The index metadata row is written as usual, a `CREATE_INDEX` row is inserted, the physical `CREATE INDEX` is skipped, and an after-commit side effect enqueues the job (deduplicated per workspace).

### Job: `ProcessDeferredSchemaOperationsJob`

Runs on `workspaceQueue`, dedupe id `deferred-schema-operations.<workspaceId>`, 3 attempts with exponential backoff. For each `PENDING` row of the workspace:

1. claim it with a conditional update (`PENDING` to `IN_PROGRESS`, `attempts + 1`),
2. resolve the index, object and fields from the metadata cache,
3. on a retry (`attempts > 1`) run `DROP INDEX CONCURRENTLY IF EXISTS` on the engine name, since a failed `CREATE INDEX CONCURRENTLY` leaves an invalid index behind,
4. run `CREATE INDEX CONCURRENTLY IF NOT EXISTS` on a dedicated connection without the 10s `query_timeout`,
5. delete the row.

A failing operation goes back to `PENDING` (or `FAILED` after the last attempt) with `lastError`, the job moves on to the next operation, then fails so the queue retries it later.

## Delivery plan

Each PR is merged on its own, everything stays behind the feature flag until the rollout PR.

| PR | Scope |
| --- | --- |
| 1 (this one) | `deferredSchemaOperation` table, feature flag, runner option, deferred join column index creation, worker job with retries. |
| 2 | Recovery: sweeper cron that resets `IN_PROGRESS` rows past a timeout and re-enqueues workspaces with `PENDING` rows; retry of `FAILED` rows (admin mutation and CLI command); metrics on pending, failed and build duration. |
| 3 | Workspace migration lock: `schemaMigrationStatus` (`IDLE` or `MIGRATING`) and `schemaMigrationStartedAt` on `core.workspace`, taken with a conditional update before a migration touching objects, fields or indexes and released in `finally` (with a takeover timeout). While taken, or while the workspace has `PENDING` or `IN_PROGRESS` operations, such migrations fail with `SCHEMA_MIGRATION_IN_PROGRESS` or `DEFERRED_SCHEMA_OPERATIONS_IN_PROGRESS`. `FAILED` rows do not block. |
| 4 | Error surfacing: runner codes sent as `subCode` (today `extensions.code` is overwritten by the GraphQL error code), object and field exception handlers map the new codes to `ConflictError`, the front `classifyMetadataError` shows a dedicated message with the pending count, the SDK CLI reads `subCode` and `userFriendlyMessage` and prints a retry hint. |
| 5 | Foreign keys: `ADD CONSTRAINT ... NOT VALID` for join columns created in the same action (the constraint is enforced on new writes immediately, the existing rows are all `NULL`), plus a deferred `VALIDATE_FOREIGN_KEY` operation carrying the constraint name computed at creation time (`fieldMetadataId` and `constraintName` columns). |
| 6 | Rollout: enable the flag for the affected self-hosted workspace, then for cloud workspaces, then turn it on by default and remove the flag. |

Out of scope for now: unique indexes, enum migrations, index updates (drop and rebuild), search vector rebuilds.

## Known limitations until PR 2 and PR 3 land

- A worker crash during a build leaves the row `IN_PROGRESS` until the sweeper exists.
- `FAILED` rows need a manual reset to `PENDING`.
- Metadata changes are not blocked while operations are pending. Deleting the field or object of a pending index cascades its row away, but a deletion racing an in-flight build can leave a physical index without metadata.
