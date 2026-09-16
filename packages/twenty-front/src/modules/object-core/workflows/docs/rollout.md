# Core workflow frontend rollout

This frontend depends on the core-ID API in #26068. Keep `IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED` disabled for general rollout until the dependencies below are satisfied. This change does not switch the background execution engine.

## Definition ownership and rollback

With the flag enabled, workflow routes use `/workflow-core/:coreWorkflowId`. Version selectors, diagrams, draft editing, output-schema keys, command-menu actions and definition mutations use core IDs. The existing workspace route resolves its mirror's core ID and redirects. A failed core query shows an error; it never loads a workspace definition as a fallback.

With the flag disabled, the workspace index, show page and mutation paths remain available. A core direct link resolves its workspace mirror and redirects. The backend's core-authoritative writes and rollback mirrors must remain deployed, including the legacy-write-to-core synchronization provided by #26068. Disabling the UI flag does not roll back database migrations.

Workflow runs remain workspace records. Run navigation, subscriptions, retry and stop continue to use the workspace run ID. The core UI uses the run's `coreWorkflowId` and `coreWorkflowVersionId` to inspect definitions. Business record IDs inside trigger payloads and step inputs are not translated.

Existing command-menu items with only `workflowVersionId` resolve the core version before executing with the flag enabled. Items containing both references prefer the core reference when enabled and the workspace reference when disabled. Apply the inherited pointer backfill and this PR's command-menu check-constraint migration before creating core-only items.

## Blocking live-update contract

The available SSE stream has workspace `objectRecordEventsWithQueryIds`, metadata events and queue events. Its record operation signatures accept workspace object metadata and workspace record IDs. There is no core workflow/version subscription contract. Core mirror writes emitting workspace events do not constitute a core event contract.

Before rollout, the SSE dependency must provide:

- Workspace-scoped, permission-checked subscriptions for core workflows and their versions, authorized by the workflow permission.
- Created, updated and deleted events carrying `coreWorkflowId` and, for version events, `coreWorkflowVersionId`.
- An ordering/revision mechanism and reconnect resynchronization, including missed deletions and draft replacement.
- Lifecycle coverage for every writer: core mutations, legacy mirror writes, activation/deactivation, draft creation/discard, duplication and deletion.

The frontend consumer must invalidate `coreWorkflows`, `coreWorkflowById`, `coreWorkflowVersionsByCoreWorkflowId` and `coreWorkflowVersionById`, reconcile removed selections and update open diagrams. It must not subscribe using workspace definition IDs. Local mutation refetches and the explicit Refresh action are implemented; remote live updates are not complete. Keep rollout blocked until that contract and consumer land and multi-session/reconnect tests pass.

## Execution dependency

B-async must make the shared execution engine, automated triggers and webhook resolution consume core definitions independently of the UI flag. Core webhook URLs contain a core workflow ID; deployed webhook ingress must accept that ID while preserving existing workspace-ID URLs. Completion of a core API request alone does not establish that scheduled or queued execution has migrated.

## Acceptance before enabling

Exercise create, rename, step/trigger/edge/position editing, activation, run inspection, duplication, version switching, draft replacement/discard and deletion with unequal core/workspace IDs. Include manual and webhook triggers, iterator, If/Else, form and code actions, and iterator schema recomputation using `coreWorkflowVersionId`.

Exercise ON → OFF → ON with edits on each UI, direct links and browser history; verify permission denial, missing records and failed queries. Verify multi-session edits, remote deletion, dropped events and SSE reconnect. Search, favorites and workspace-object teardown remain separate migrations.
