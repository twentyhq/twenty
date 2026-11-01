# Core workflow execution

Workflow execution uses `core.workflow`, `core.workflowVersion`, and the persisted run snapshot. The workflow UI feature flag only selects editing and display APIs. Turning it off does not switch workers back to workspace definitions.

## Storage and compatibility

| Field | Purpose and lifetime |
| --- | --- |
| `core.workflow.id` | Authoritative workflow identity. |
| `core.workflowVersion.coreWorkflowId` | Authoritative version parent, scoped to the same workspace. |
| `core.workflow.workspaceWorkflowId` | Durable alias for existing webhook URLs and historical billing spender IDs. Keep this alias for the lifetime of those URLs and billing identities. |
| `core.workflowVersion.workspaceWorkflowVersionId` | Durable alias for legacy run requests and pinned queued payloads. Keep it while any legacy callers or queued jobs can exist. |
| `core.workflowVersion.workflowId` | Nullable legacy parent alias, equal to the workflow's `workspaceWorkflowId`. Null on workflows created without a workspace alias. It is not the execution parent. |
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

Cron workers share the historical workflow lock key for mapped workflows and the core ID for mirrorless workflows. Cached cron entries are normalized before taking the lock, so an obsolete entry cannot consume the current definition's occurrence. Queue producers retain legacy aliases when available, and consumers continue accepting old envelopes.

## Writes

Workflow creation, rename, duplication, deletion, version content, drafts, activation and deactivation write core only. The workspace `workflow`, `workflowVersion` and `workflowAutomatedTrigger` objects are no longer written; existing rows stay as data. Workflows created through core, and their versions, have no workspace alias. Generic workflow mutations cannot change execution links or version content.

## Deployment and rollback

1. Include the parent-link repair and core mutation prerequisites. The core API prerequisite owns the 2.42 version-alias schema and backfill; both APIs and execution use that same alias. Apply that schema command and the 2.42 execution-compatibility schema command before deploying consumers that select the alias. The latter makes the legacy parent nullable and enforces unambiguous version aliases; it does not create a second alias column.
2. Establish a write barrier for the initial cutover: pause workflow mutation and run API traffic, application imports and workspace provisioning, schedulers, database-event dispatch, and workflow consumers. Wait for in-flight transactions to finish. Keep queued and delayed jobs intact. Old writers do not populate the new version alias, so running a backfill while those writers remain active is unsafe.
3. With that barrier held, run the 2.42 parent-link repair, shared version-alias backfill, workflow execution mapping backfill, and projection-nullability command. Dry-run and resolve reported mapping conflicts, then commit and verify the backfill. The execution backfill requires the shared aliases to be populated, then validates pending runs and published pointers transactionally; it does not overwrite or independently populate version aliases.
4. Deploy upgraded workers and queue consumers before the API and scheduler producers. Keep the barrier until every definition writer uses synchronous durable mappings and every consumer supports core-only execution. Then resume traffic and consumers. A UI flag change does not establish this barrier. A zero-downtime rollout instead requires a separate preparatory release that maintains the durable mappings on every writer before the backfill; this PR does not assume that release already exists.
5. Verify old webhook URLs, legacy version requests, queued runs, delayed jobs, form continuations, and cron overlap. No queue purge or delayed-job renaming is required. Compatible envelopes allow old queued work to drain after the cutover; do not resume old definition writers or introduce mirrorless producers while old consumers remain.
6. Workspace projections are no longer maintained. Rolling the binaries back to a release that reads or requires them breaks editing workflows created afterwards, since those have no workspace rows.

Do not drop legacy payload decoding or aliases merely because the UI rollback window has ended. Delayed jobs and integrations can outlive that window. Removing workspace workflow objects, rebuilding workflow show pages, rekeying MCP tools, and migrating historical usage are separate changes.
