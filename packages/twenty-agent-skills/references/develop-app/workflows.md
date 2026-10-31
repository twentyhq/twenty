# Workflows

Use when the app needs to ship a workflow, or when a logic function should be invocable from the workflow builder.

See `logic.md` for post-install hooks. See `app-structure.md` for source layout.

## Mental Model

Declare app workflows with `defineWorkflow` from `twenty-sdk/define`: one call per workflow, holding a trigger and its steps. Install creates it active; installing a new app version updates it in place. Users can't edit an installed workflow — they duplicate it.

Workflows created at runtime through the workspace API are a `Workflow` plus at least one `WorkflowVersion`. Creating a `Workflow` auto-creates its draft `v1`; never create a `WorkflowVersion` directly.

## defineWorkflow

- The workflow and each step need a stable `universalIdentifier`. The trigger's is optional.
- `nextStepIds` wires the graph: the trigger points to the first steps, each step to the steps after it.
- Trigger types: `MANUAL`, `CRON`, `DATABASE_EVENT`, `WEBHOOK`. Step types exclude the builder's `CODE` — use `LOGIC_FUNCTION`.
- Reference objects, fields, logic functions and agents by universal identifier, never by name or id.
- Triggers take optional `name`, `position` and `outputSchema`; steps take optional `position` and `outputSchema`. They only shape the builder view. Omit them to get the derived defaults.
- `position: null` means no position. `outputSchema: {}` means an empty schema; omit `outputSchema` to derive it.
- `twenty app pull` on the workspace Custom application writes builder workflows in this form, keeping the builder's trigger name, positions and output schemas.

## AI Agent Steps

- `AI_AGENT` runs one of the app's agents, named with `agentUniversalIdentifier`, and takes the step's `prompt`, `responseFormat`, `humanInputInstructions`, `conversation` and `workspaceMemberId` (the member the agent's conversation is with).
- A step can only name an agent the app exports: `twenty app pull` reports a workflow on any other agent as unsupported.

## Email and Calendar Steps

- `SEND_EMAIL`, `DRAFT_EMAIL` and `CREATE_CALENDAR_EVENT` name their account with exactly one of `connectedAccountId` or `connectedAccountHandle`.
- Use `connectedAccountHandle` (the account's email address) in app code: ids only exist in one workspace. Apply resolves it to the oldest active account with that address that is shared with the workspace (`WORKSPACE` scope) and can run the step, and fails if none can. A member's private account can't be named by handle.
- `twenty app pull` writes a shared account's id as its handle. Private account ids, variables and workspace member ids stay `connectedAccountId`.

## Manual Record Trigger

- Trigger type: manual record selection.
- The selected record is the trigger payload — no wrapping `record` field.
- Reference fields with `{{trigger.<field>}}`. Do not use `{{trigger.record.<field>}}`.

## Lifecycle Through the Workspace API

Only for workflows created at runtime, e.g. from a post-install hook, instead of `defineWorkflow`. Always: create → configure draft → activate. Never publish a draft directly.

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
