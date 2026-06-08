# Workflows

Use when the app needs to ship a manual workflow on install, or when a logic function should be invocable from the workflow builder.

See `logic.md` for post-install hooks. See `app-structure.md` for source layout.

## Mental Model

Twenty workflows are workspace records, not app entities — no `define*` primitive. Ship them via `definePostInstallLogicFunction` and the workspace API.

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

`yarn twenty dev --once` skips install hooks. Run again after rebuilding to verify idempotency.
