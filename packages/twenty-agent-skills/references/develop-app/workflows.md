# Workflows

Use when the app needs to ship a manual workflow on install, or when a logic function should be invocable from the workflow builder.

See `logic.md` for post-install hooks. See `app-structure.md` for source layout.

## Mental Model

Declare app workflows with `defineWorkflow` from `twenty-sdk/define`: one call per workflow, holding a trigger and its steps. `twenty app pull` writes workflows in this form.

Workflows created at runtime through the workspace API are a `Workflow` plus at least one `WorkflowVersion`. Creating a `Workflow` auto-creates its draft `v1`; never create a `WorkflowVersion` directly.

## Email and Calendar Steps

- `SEND_EMAIL`, `DRAFT_EMAIL` and `CREATE_CALENDAR_EVENT` name their account with exactly one of `connectedAccountId` or `connectedAccountHandle`.
- Use `connectedAccountHandle` (the account's email address) in app code: ids only exist in one workspace. Apply resolves it to the oldest active account with that address that is shared with the workspace (`WORKSPACE` scope) and can run the step, and fails if none can. A member's private account can't be named by handle.
- `twenty app pull` writes a shared account's id as its handle. Private account ids, variables and workspace member ids stay `connectedAccountId`.

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
twenty app exec
```

`twenty app apply` skips install hooks. Run it again after rebuilding to verify idempotency.
