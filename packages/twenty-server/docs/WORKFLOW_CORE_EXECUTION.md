# Core workflow execution

Workflow execution uses `core.workflow`, `core.workflowVersion`, and the persisted run snapshot. The workflow UI feature flag only selects editing and display APIs. Turning it off does not switch workers back to workspace definitions.

## Storage and compatibility

| Field | Purpose and lifetime |
| --- | --- |
| `core.workflow.id` | Authoritative workflow identity. |
| `core.workflowVersion.coreWorkflowId` | Authoritative version parent, scoped to the same workspace. |
| `core.workflow.workspaceWorkflowId` | Durable alias for existing webhook URLs and historical billing spender IDs. Keep this alias for the lifetime of those URLs and billing identities. |
| `core.workflowVersion.workspaceWorkflowVersionId` | Durable alias for legacy run requests and pinned queued payloads. Keep it while any legacy callers or queued jobs can exist. |
| `core.workflowVersion.workflowId` | Nullable legacy parent alias maintained for rollback projections. It is not the execution parent. |
| `workflowRun.coreWorkflowId`, `workflowRun.coreWorkflowVersionId` | Authoritative identities recorded when a run is created and backfilled for existing runs. |
| `workflowRun.workflowId`, `workflowRun.workflowVersionId` | Nullable projection relations. Mirrorless runs leave both null. |
| `workflowRun.state.flow` | Captured trigger and steps. Startup, retry, delay, and form continuation use this snapshot rather than a subsequently edited definition. |

Legacy and core run mutations delegate to the same core runner. Core-owned mappings determine projection relation values and billing spenders. Missing or conflicting tenant, parent, or version mappings fail explicitly. A webhook alias can resolve only a workflow in the requested workspace, and its published version must belong to that workflow, be active, and have a webhook trigger.

## Background execution inventory

| Entry point | Definition source |
| --- | --- |
| `WorkflowTriggerJob` | Core version supplied in the payload; otherwise the durable legacy version mapping; otherwise the core workflow's published pointer for genuinely unversioned legacy jobs. |
| `RunWorkflowJob` startup | Pinned core version identity and the run's captured trigger and steps. |
| `RunWorkflowJob` resume and retry | Persisted run state and step information. |
| `ResumeDelayedWorkflowJob` and form submission | Existing run ID and step ID; the continuation reads the run snapshot. |
| Database event listener | Core-derived automated trigger cache, with workspace business records and metadata used for filtering. |
| `WorkflowCronTriggerCronJob` | Current active core cron definition, including when decoding old Redis entries. |
| Enqueue sweeps, throttling, stalled-run repair | Workspace run rows and run counters; no workflow definition lookup. |
| Workflow run retention | Core workflow identity, with a legacy fallback for historical runs. |
| `WorkflowStatusesUpdateJob` | Workspace projections for UI status maintenance only. |
| `WorkflowCoreConsistencyService` | Compares core definitions and rollback projections for diagnostics. Missing projections are distinguished from missing core definitions; mirrorless definitions are not classified as orphaned. |

Cron workers share the historical workflow lock key for mapped workflows and the core ID for mirrorless workflows. Cached cron entries are normalized before taking the lock, so an obsolete entry cannot consume the current definition's occurrence. Queue producers retain legacy aliases when available, and consumers continue accepting old envelopes.

## Writes

Dedicated legacy builder and lifecycle mutations mirror execution changes within their transactions. Initial versions and core-created drafts persist the durable version alias synchronously. Generic workflow mutations cannot change execution links directly; generic version content and lifecycle writes remain restricted to dedicated mutations. Allowed workflow updates, deletion, and restoration synchronize core before returning.

Core writes use workspace repositories for outgoing projection changes, preserving database events. The reverse workflow listener uses event IDs to lock and read current workspace records. It does not apply historical event snapshots, preventing a delayed update or delete event from overwriting a newer projection.

## Deployment and rollback

1. Include the parent-link repair and core mutation prerequisites. Apply the 2.42 instance schema command before deploying consumers that select the new version alias.
2. Establish a write barrier for the initial cutover: pause workflow mutation and run API traffic, application imports and workspace provisioning, schedulers, database-event dispatch, and workflow consumers. Wait for in-flight transactions to finish. Keep queued and delayed jobs intact. Old writers do not populate the new version alias, so running a backfill while those writers remain active is unsafe.
3. With that barrier held, run the 2.42 parent-link repair, workflow execution mapping backfill, and projection-nullability command. Dry-run and resolve reported mapping conflicts, then commit and verify the backfill. The backfill validates pending runs and published pointers transactionally.
4. Deploy upgraded workers and queue consumers before the API and scheduler producers. Keep the barrier until every definition writer uses synchronous durable mappings and every consumer supports core-only execution. Then resume traffic and consumers. A UI flag change does not establish this barrier. A zero-downtime rollout instead requires a separate preparatory release that maintains the durable mappings on every writer before the backfill; this PR does not assume that release already exists.
5. Verify old webhook URLs, legacy version requests, queued runs, delayed jobs, form continuations, and cron overlap. No queue purge or delayed-job renaming is required. Compatible envelopes allow old queued work to drain after the cutover; do not resume old definition writers or introduce mirrorless producers while old consumers remain.
6. The UI flag can move ON → OFF → ON independently. Preserve synchronous projections during the rollback window; run execution remains core-only throughout. Rolling the binaries back also requires pausing writes and consumers and re-establishing mappings before the next core-only cutover.

Do not drop legacy payload decoding or aliases merely because the UI rollback window has ended. Delayed jobs and integrations can outlive that window. Removing workspace workflow objects, rebuilding workflow show pages, rekeying MCP tools, and migrating historical usage are separate changes.
