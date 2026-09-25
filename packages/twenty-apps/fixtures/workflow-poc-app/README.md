# Application workflow POC

This fixture requires the SDK and server from this branch and a development workspace with `IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED` enabled. It creates one application-owned core workflow and one ACTIVE version, without workspace workflow/version mirrors. Normal editor operations are read-only; the workflow show page provides Run.

From the repository root, build `twenty-shared` and `twenty-sdk` using the usual workspace build. Configure the local CLI connection (`twenty remote:add`) and run `twenty dev` from this fixture using the locally built CLI. Do not use the currently published SDK: it does not include defineWorkflow.

1. Install/sync the fixture and open **Application greeting** in Workflows.
2. Click Run; the Greet step returns `Before upgrade`.
3. Change only `input.greeting` in `src/workflows/greeting.workflow.ts` to `After upgrade` and let dev mode sync.
4. Run again. The new run returns `After upgrade`; the earlier run retains its saved graph and result. Workflow and version IDs stay unchanged. Resyncing unchanged source creates no extra version.
5. Try renaming, deleting, deactivating, or creating a draft through the normal workflow API: app-owned definitions reject edits.

The manifest uses universal IDs for the workflow, version, trigger, steps, and referenced logic functions. The server resolves functions from the same application's declared workflow actions into workspace-specific IDs, including functions installed in the same sync.

The graph saved on each run is the execution snapshot. Updating a definition does not rewrite runs, including pending/retried runs. Logic-function implementations are not pinned: a step that executes after an app update uses the current function implementation. Do not remove functions still needed by existing runs.

POC limitations: manual triggers only; no command-menu trigger registration, app-workflow duplication, removal, export/pull, dependency pinning, or application uninstall safety. Removing a workflow from the manifest or changing its version universal ID is rejected. Automated triggers, application execution permissions, and rollout/rollback support need separate work before production rollout. Existing workspace-owned workflows retain their rollback mirrors.

## Supported steps

`defineWorkflow` supports every existing workflow action: `CODE`, `LOGIC_FUNCTION`, `SEND_EMAIL`, `DRAFT_EMAIL`, `CREATE_CALENDAR_EVENT`, `CREATE_RECORD`, `UPDATE_RECORD`, `DELETE_RECORD`, `UPSERT_RECORD`, `FIND_RECORDS`, `PICK_RECORD`, `FORM`, `HTTP_REQUEST`, `AI_AGENT`, `CLASSIFY`, `FILTER`, `IF_ELSE`, `ITERATOR`, `DELAY`, and `EMPTY`.

Every step has a stable `universalIdentifier`, `name`, `type`, `input`, and `nextStepIds`. Optional `position`, `outputSchema`, `expectedOutputSchema`, and `errorHandlingOptions` use the existing workflow action formats. Inputs use the native action schemas with these portable metadata references:

| Step                         | Manifest reference                                                  | Resolved at installation                                                                       |
| ---------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `CODE`, `LOGIC_FUNCTION`     | Top-level `logicFunctionUniversalIdentifier`                        | An app-declared function ID; `LOGIC_FUNCTION` additionally requires an exposed workflow action |
| Record actions               | `input.objectUniversalIdentifier`                                   | Object API name                                                                                |
| `FIND_RECORDS` filters/sorts | `fieldMetadataUniversalIdentifier`                                  | Field ID, checked against the selected object                                                  |
| `PICK_RECORD` load balancing | `loadBalance.objectUniversalIdentifier`, `fieldUniversalIdentifier` | Object and field API names                                                                     |
| `FILTER`, `IF_ELSE` filters  | Optional `fieldMetadataUniversalIdentifier`                         | Field ID                                                                                       |
| `FORM` record picker         | `settings.objectUniversalIdentifier`                                | Object API name                                                                                |
| `AI_AGENT`                   | Optional `input.agentUniversalIdentifier`                           | An app-declared agent ID                                                                       |

Objects and fields can come from the same installation or metadata already installed in the workspace. Record values and `fieldsToUpdate` use API field names. Record IDs and connected-account IDs are runtime data, not metadata universal identifiers; provide workspace-specific values or workflow variable references. Existing execution permissions still apply.

A record step can use an object declared by the same app:

```ts
{
  universalIdentifier: CREATE_COMPANY_STEP_ID,
  name: 'Create company',
  type: 'CREATE_RECORD',
  input: {
    objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
    objectRecord: { name: '{{trigger.companyName}}' },
  },
  nextStepIds: [],
}
```

For `IF_ELSE`, each branch's `nextStepIds` identifies its entry steps. For `ITERATOR`, `input.initialLoopStepIds` identifies the loop body, while the iterator's `nextStepIds` identifies the steps after the loop. Loop-body terminal steps have no outgoing edge; do not add a back edge to the iterator. Manifest validation checks these edges for missing steps, cycles and reachability.

`CODE` uses a separately declared app logic function rather than inline source. External integrations still require their normal setup: connected accounts for email/calendar, AI availability for agent/classification actions, and reachable HTTP endpoints. Supporting their definitions does not bypass those requirements or change their permissions.
