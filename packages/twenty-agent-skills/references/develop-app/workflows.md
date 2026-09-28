# Workflows

Use when the app needs to ship a manual workflow on install, or when a logic function should be invocable from the workflow builder.

See `logic.md` for post-install hooks. See `app-structure.md` for source layout.

## Application-defined workflows (experimental)

`defineWorkflow` from `twenty-sdk/define` is a development POC for app-owned core workflows. Use it only with a compatible SDK/server and the core workflow flag enabled. It accepts a MANUAL trigger and all existing workflow action types. `LOGIC_FUNCTION` steps reference app-declared functions exposed with `workflowActionTriggerSettings`; `CODE` steps can reference any app-declared function. Both use a top-level `logicFunctionUniversalIdentifier`.

Declare `universalIdentifier`, `name`, and `version`. The version has its own stable `universalIdentifier`, a `trigger` with a universal identifier and `nextStepIds`, and `steps`. Each step declares its universal identifier, name, type, typed input, and `nextStepIds` pointing to step universal identifiers. Record actions use `input.objectUniversalIdentifier`; record values use API field names. Filter and sort metadata references use `fieldMetadataUniversalIdentifier`. Agent steps use `input.agentUniversalIdentifier`. Record-picker form fields use `settings.objectUniversalIdentifier`. For `IF_ELSE`, branch `nextStepIds` identify branch entries; for `ITERATOR`, `input.initialLoopStepIds` identifies the body and the step's `nextStepIds` identifies what follows the loop. Connected-account IDs and record IDs are runtime inputs, not metadata universal identifiers. All steps must be reachable. Every loop-body path must return to its enclosing iterator; other cycles are rejected.

Application sync installs one ACTIVE core version. Updates modify that same version and preserve workflow/version IDs. Existing runs retain their saved graph; referenced function implementations are current, not pinned to the old app release. App workflows are read-only through normal workflow APIs and the editor, with Run available on the show page. Do not seed or activate these definitions through install hooks.

Workflow removal and version-ID replacement are rejected. Automated triggers, export/pull, duplication, uninstall safety and application execution permissions are not implemented by this POC. Do not use this as production rollout guidance.

## Existing workspace workflow API

For existing workspaces using the workspace workflow APIs, workflows can still be seeded via `definePostInstallLogicFunction`. The remaining sections describe that older lifecycle, not `defineWorkflow` app definitions.

A workflow is a `Workflow` plus at least one `WorkflowVersion`. Creating a `Workflow` auto-creates its draft `v1`; never create a `WorkflowVersion` directly.

## Manual Record Trigger

- Trigger type: manual record selection.
- The selected record is the trigger payload — no wrapping `record` field.
- Reference fields with `{{trigger.<field>}}`. Do not use `{{trigger.record.<field>}}`.

## Lifecycle

Always: create → configure draft → activate. Never publish a draft directly.

1. Find or create the `Workflow` by stable name or slug. `createWorkflow` produces the draft `v1`.
2. Set the trigger on the draft via `updateWorkflowVersion`.
3. Add steps via the workflow-step mutations. `createWorkflowVersionStep` returns a `stepsDiff`, not the step — read the diff for the new step id, then call `updateWorkflowVersionStep` with the full payload.
4. Activate via `activateWorkflowVersion`.

Forbidden:

- Do not write `Workflow.statuses` — it is computed from the active version's status.
- Do not create `WorkflowVersion` rows directly.

## Idempotency

Find by deterministic name or slug before creating. Single-record queries throw on absence in some Twenty versions — treat not-found as "needs create."

## Permissions

Seeders need workflow settings permissions on the app role. Grant via `defineRole`. If a typed mutation is rejected from the app context, fix the role — falling back to raw GraphQL signals the wrong scope.

## Invoking Locally

```bash
yarn twenty dev:function:exec
```

`yarn twenty apply` skips install hooks. Run it again after rebuilding to verify idempotency.


Application workflows are experimental. Enable `IS_APPLICATION_WORKFLOWS_ENABLED` to install or update workflow definitions and start new runs, and enable `IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED` for the core workflow UI. Both flags default off unless configured. Disabling the application-workflow flag blocks installation/updates containing workflows and hides Run; it does not delete definitions or interrupt already-started runs. The older workspace UI cannot display these core-only definitions. Execution permissions, uninstall safety and dependency pinning remain outside this POC.

Output schemas are populated during installation without executing steps. Explicit step `outputSchema` takes precedence. CODE and LOGIC_FUNCTION steps can reuse the referenced function's `workflowActionTriggerSettings.outputSchema`; otherwise provide an `expectedOutputSchema` containing a representative result. HTTP_REQUEST also uses `expectedOutputSchema`. AI_AGENT uses the referenced agent's response format. Arbitrary code and HTTP response shapes cannot be inferred without an output declaration. Keep declarations in sync with the implementation.

Record-write field names are checked against metadata from the target workspace and the same app installation. UPDATE_RECORD must select existing fields and provide their values in `objectRecord`.

For `FIND_RECORDS`, use `orderBy.recordSorts` with `fieldMetadataUniversalIdentifier` and `direction`. The installer resolves these references into runtime ordering. Application manifests reject raw `gqlOperationOrderBy`.
