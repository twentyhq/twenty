# Application workflow POC

This fixture requires the SDK and server from this branch and a development workspace with `IS_WORKFLOW_CORE_ENABLED` enabled. It creates one application-owned core workflow and one ACTIVE version, without workspace workflow/version mirrors. Normal editor operations are read-only; the workflow show page provides Run.

From the repository root, build `twenty-shared` and `twenty-sdk` using the usual workspace build. Configure the local CLI connection (`twenty remote:add`) and run `twenty dev` from this fixture using the locally built CLI. Do not use the currently published SDK: it does not include defineWorkflow.

1. Install/sync the fixture and open **Application greeting** in Workflows.
2. Click Run; the Greet step returns `Before upgrade`.
3. Change only `input.greeting` in `src/workflows/greeting.workflow.ts` to `After upgrade` and let dev mode sync.
4. Run again. The new run returns `After upgrade`; the earlier run retains its saved graph and result. Workflow and version IDs stay unchanged. Resyncing unchanged source creates no extra version.
5. Try renaming, deleting, deactivating, or creating a draft through the normal workflow API: app-owned definitions reject edits.

The manifest uses universal IDs for the workflow, version, trigger, steps, and referenced logic functions. The server resolves functions from the same application's declared workflow actions into workspace-specific IDs, including functions installed in the same sync.

The graph saved on each run is the execution snapshot. Updating a definition does not rewrite runs, including pending/retried runs. Logic-function implementations are not pinned: a step that executes after an app update uses the current function implementation. Do not remove functions still needed by existing runs.

POC limitations: manual triggers and logic-function actions only; no command-menu trigger registration, app-workflow duplication, removal, export/pull, dependency pinning, or application uninstall safety. Removing a workflow from the manifest or changing its version universal ID is rejected. Automated triggers, portable record/field references, application execution permissions, and rollout/rollback support need separate work before production rollout. Existing workspace-owned workflows retain their rollback mirrors.
