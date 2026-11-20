# Core workflows

Workflow definitions live in core: `core.workflow` and `core.workflowVersion`. Runs stay workspace records (`workflowRun`). Each run carries a snapshot of the trigger and steps it executes. Internal code addresses workflows and versions by core id. Historical identifiers are resolved only at the compatibility boundaries listed below.

## Ownership

| Concern | Owner |
| --- | --- |
| Definition writes (create, rename, duplicate, delete, version content, drafts) | `CoreWorkflowMutationWorkspaceService`, `CoreWorkflowVersionMutationWorkspaceService`, `CoreWorkflowVersionWriteService`, through the metadata migration runner |
| Activation and deactivation | `CoreWorkflowLifecycleWorkspaceService`. Version statuses, the published pointer and the manual-trigger command menu item are written in one metadata migration, under the workflow lifecycle lock. |
| Read, edit and application-trigger permissions | `CoreWorkflowAccessService`. It returns the authorized workflow or version entity, so callers do not reload it. |
| Execution-side reads of core definitions | `CoreWorkflowTriggerService` (`findCoreVersionById`, `findCoreWorkflowById`, and `findCoreWorkflowByIdOrWorkspaceWorkflowId` for compatibility boundaries) |
| Derived trigger caches | `CoreWorkflowTriggerService.refreshTriggerCachesAfterCommit`, see below |
| Application-managed workflows | The application manifest sync and its `workflow` metadata side effects. Editing APIs refuse to modify them. |

## Identifiers

| Field | Purpose and lifetime |
| --- | --- |
| `core.workflow.id` | Workflow identity. |
| `core.workflowVersion.coreWorkflowId` | Version parent, scoped to the same workspace. |
| `core.workflow.workspaceWorkflowId` | Alias kept for existing webhook URLs, historical billing spender ids and the cron lock key. Keep it for the lifetime of those URLs. |
| `core.workflowVersion.workflowId` | Legacy parent alias, equal to the workflow's `workspaceWorkflowId`. Writers still set it; nothing reads it at runtime. It can be dropped by an instance command once a release that no longer reads it has shipped. |
| `core.workflowVersion.workspaceWorkflowVersionId`, `core.workflow.lastPublishedVersionId` | Legacy version aliases. Nothing reads them at runtime; the 2.62 instance command drops them. |
| `workflowRun.coreWorkflowId`, `workflowRun.coreWorkflowVersionId` | Run identities recorded at creation. |
| `workflowRun.workflowId`, `workflowRun.workflowVersionId` | Nullable legacy relations, only set on runs created before core execution. |
| `workflowRun.state.flow` | Captured trigger and steps. Startup, retry, delay and form continuation use this snapshot, not the current definition. |

Compatibility boundaries that resolve historical identifiers:

- **Webhook URLs**: `/webhooks/workflows/<workspace>/<id>` accepts the core id or `workspaceWorkflowId`. The published version must belong to that workflow, be active, and have a webhook trigger.
- **Queued `WorkflowTriggerJob` payloads**: the job loads the workflow from the payload's `coreWorkflowVersionId`. It accepts a `workflowId` equal to either the core id or `workspaceWorkflowId`, because older producers sent the alias. Current producers send the core id.
- **Cached cron entries**: each entry is normalized against the workflow's current published core version before the lock is taken, so old entries keyed by the alias still resolve, and an obsolete entry cannot consume the current definition's occurrence.
- **Old front URLs**: `GetCoreWorkflowLegacyMapping` maps a workspace workflow id to its core id.

## Background execution

| Entry point | Definition source |
| --- | --- |
| `WorkflowTriggerJob` | Core version from the payload, and its parent workflow. |
| `RunWorkflowJob` startup | Pinned core version and the run's captured trigger and steps. |
| `RunWorkflowJob` resume and retry | Persisted run state and step information. |
| `ResumeDelayedWorkflowJob` and form submission | Existing run and step ids; the continuation reads the run snapshot. |
| Database event listener | Core-derived automated trigger maps, plus workspace records and metadata for filtering. |
| `WorkflowCronTriggerCronJob` | Active core cron definition, after normalizing the cached entry. The lock key is `workflow-cron:<workspace>:<legacyWorkflowId ?? workflowId>`, so overlapping old and new entries share one lock. |
| Stalled-run repair | Workspace run rows and in-flight queue jobs; no definition lookup. |
| Workflow run retention | Core workflow identity, with a legacy fallback for historical runs. |

## Derived caches

Two caches are derived from committed definitions: the workspace `workflowAutomatedTriggerMaps` and the `workflow-cron-triggers` hash. They are refreshed after the metadata migration commits, only through `refreshTriggerCachesAfterCommit`. The failure contract:

- **Cron hash**: entries are published with `hashSetIfExists` and removed with `hashDelete`. If either fails, the whole hash is dropped and the next cron tick rebuilds it from the database. Stale entries are harmless, because the cron job normalizes each one against the published core version.
- **Automated trigger maps**: invalidated and recomputed from the database. If that fails, `CoreWorkflowPostCommitError` is raised: the definition change is committed, but the maps may stay stale until the next successful refresh.

The trigger-map computation returns empty maps while its guard column is still hidden by an in-flight upgrade. A cross-version upgrade from an old release would otherwise compute maps before `coreWorkflowId` is backfilled.

## Known leftovers

- `WorkflowCoreSyncService` only holds `deleteFromCore`. The released `upgrade:2-42:delete-orphan-core-workflows` command injects it, so it stays in place until 2.42 leaves the upgrade window. Then it can move to `CoreWorkflowMutationWorkspaceService`.
- `commandMenuItem.workflowVersionId` (column, CHECK constraint, DTO and front usage) still exists next to `coreWorkflowVersionId`.

## Rollout history

The cutover from workspace definitions to core happened in these steps. They only matter for an instance upgrading across them.

1. **2.42.** Introduced the version alias, the parent-link repair, the execution mapping backfill and nullable run projections. These ran under a write barrier: mutation and run traffic, imports, schedulers, database-event dispatch and consumers paused; queued and delayed jobs kept. Upgraded workers were deployed before the API and scheduler producers. Queued work drained through compatible envelopes, with no queue purge.
2. **2.60.** Dropped the workspace `workflow`, `workflowVersion` and `workflowAutomatedTrigger` standard definitions; existing rows stay as data. Rolling back to a release that reads workspace definitions breaks workflows created afterwards, which have no workspace rows.
3. **2.61.** A workspace command backfilled core ids onto legacy-only command menu items and workflows.
4. **2.61 runtime.** Runtime reads of `workspaceWorkflowVersionId` and `lastPublishedVersionId` stopped. `WorkflowTriggerJob` became core-only.
5. **2.62.** An instance command drops those two columns.

Do not drop legacy payload decoding or the `workspaceWorkflowId` alias just because a rollback window has ended. Delayed jobs, webhooks and integrations can outlive it.
