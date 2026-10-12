# Logic

Use this reference for Twenty app logic functions, skills, agents, and connection providers.

## Logic Functions

A logic function file should contain trigger registration, input validation, the call out to the work, and the writes back — nothing else. Everything else lives next to it (see `app-structure.md`):

- External API calls → `src/<service>-client/<name>.ts`.
- Response parsing and mapping → `src/utils/<name>.util.ts`.
- Response and DTO types → `src/types/<name>.ts`.
- Shared structure across object types → one mapper factory parameterized by object kind, not parallel functions.

Kebab-case filenames, one export per file. Response/DTO types go in `src/types/<name>.ts` and parsing/mapping helpers in `src/utils/<name>.util.ts` — never export both a type and a util from the same file (a local, non-exported type may stay with the util), and never put multiple function exports in one file. See `app-structure.md`.

Other rules:

- Validate required fields before writes or remote calls.
- Prefer bulk inputs for record actions. If a logic function can be triggered from selected records, the canonical input should be `records: Array<{ id: string; ...fields }>` unless the user explicitly says the function is only for one record.
- Use `id` inside a `records` array for the Twenty record ID. Do not add `recordId`, object-specific IDs such as `companyId`, or flat single-record payloads unless the user explicitly requests a single-record contract.
- Return a bulk summary with per-record results for multi-record actions, including counts for success, no match, and failed records.
- Prefer idempotent behavior for jobs and repeated invocations.
- Read secrets through the application-config helper, not raw `process.env`.
- An application variable declared with `scope: 'USER'` is in `process.env` with the value of the member who triggered the run, or its default until they set their own; a run nobody triggered (cron, install hooks) gets no user variables. That member is not always the one the run is about: a database event runs as whoever edited the record. For example, with a user `SLACK_TOKEN`, a function on opportunity update posts with the editor's token, not the opportunity owner's. When the run is about someone else or every member, read the values with `myUserApplicationVariables` through `new MetadataApiClient({ runAs: 'application' })`.
- Twenty injects `TWENTY_API_URL`, `TWENTY_APP_ACCESS_TOKEN`, `TWENTY_APP_APPLICATION_ACCESS_TOKEN`, `TWENTY_API_KEY`, `TWENTY_FUNCTIONS_URL` and `APPLICATION_ID` into every run. Never declare an application or server variable with one of these names: the manifest is rejected on sync and publish.
- Do not hide customer-impacting side effects behind UI-only actions.

Soft cap: a `*.logic-function.ts` or `*.post-install.ts` file over 200 lines is a refactor signal.

## Bulk Record Actions

Bulk is the default logic-function contract for actions that may run from front component selection. The front component should gather selected records and invoke the function once. Do not make the front component loop over selected records and execute the same logic function repeatedly unless there is an explicit single-record requirement.

Preferred input:

```ts
type BulkInput<TRecord extends { id: string }> = {
  records: TRecord[];
};
```

Preferred output:

```ts
type BulkResult = {
  ok: boolean;
  enrichedCount: number;
  noMatchCount: number;
  failedCount: number;
  results: Array<{
    id: string;
    status: 'ENRICHED' | 'NO_MATCH' | 'FAILED';
    pdlId?: string;
    error?: string;
  }>;
};
```

For existing single-record functions that are being upgraded to selected-record actions, replace the old flat input with `records: Array<{ id: string; ...fields }>` unless the user explicitly asks for backward compatibility.

Extract and test:

- input normalization for the canonical bulk shape;
- per-record validation;
- external API payload mapping;
- per-record result mapping;
- summary count aggregation;
- error message normalization.

## Skills And Agents

Skills and agents should describe when they apply, what context they need, and what output is expected.

When adding AI behavior:

- Make trigger rules concrete.
- Keep instructions grounded in available app data and tools.
- State when the agent should ask for missing workspace or record context.
- Avoid exposing raw IDs, timestamps, or nested API output to end users when a readable answer is possible.
- A `defineAgent` `roleUniversalIdentifier` must reference a role the app defines, and the application role (`defineApplicationRole` or `defaultRoleUniversalIdentifier`) must cover every permission that agent role grants. The build and `yarn twenty apply` fail otherwise, listing the excess grants.

## Inbox Messages

`sendInboxMessage` from `twenty-sdk/logic-function` posts a message from the app in the chats of one or more workspace members.

- `workspaceMemberIds` lists the members who receive it (at least one), and `text` is the message, in markdown. The first member of a new conversation owns it and the others follow it; a later send with the same key that lists new members adds them.
- `threadKey` picks the conversation per app, shared by every member it is sent to: a new key starts one titled `title`, a known key adds to it. `idempotencyKey` identifies the message in it, so sending again with the same keys writes nothing and retries never duplicate it.
- `toolCall` (optional) ends the message on `ask_question` (one multiple-choice question), `request_form` or `propose_tool_call`, which pause the conversation until the member answers, or on one of the app's own tools by `logicFunctionUniversalIdentifier`, rendered by its front component without pausing.
- `propose_tool_call` takes `toolName`, `arguments` and a one-sentence `summary`. The tool must be one the app's default role could run itself, such as `create_one_person` or `update_one_opportunity` (with `id`), or `send_email` / `draft_email` (`recipients`, `subject` and an HTML `body`), which need no permission of the app. The member reviews the call, edits it if they want, and the approved call runs with their own access.
- Only one call the member answers (`ask_question`, `request_form`, `propose_tool_call`) can wait at a time; another fails with `THREAD_AWAITING_ANSWER` until they answer. Plain messages and app tool calls are still accepted.
- A conversation its owner deleted is gone for every member and is not recreated.
- The app's default role needs `SystemPermissionFlag.AI`, and every member needs the AI permission.
- It always uses the app's access and ignores `runAs`.

## Connection Providers

For third-party connections:

- Keep secrets out of source and public assets.
- Document required OAuth or API setup in the app README or listing.
- Verify failure states for expired or missing credentials.

## Post-Install Hooks

Use `definePostInstallLogicFunction` for records that must exist on install — default workflows, views, roles, or seeded reference data. Do not implement this as runtime first-run code.

Post-install hook files live alongside other logic functions (typically `src/logic-functions/<name>.post-install.ts`). Kebab-case filename, one export per file.

Hooks must be idempotent: find by stable identifier before creating, update if it exists, never duplicate. Treat a not-found from a single-record query as "needs create."

Do not write fields Twenty computes elsewhere (workflow `statuses` is computed from version status — see `workflows.md`).

Dev sync skips install hooks. Invoke locally:

```bash
yarn twenty dev:function:exec
```

Run again after rebuilding to verify idempotency.

## Uninstall Hook

Use `defineUninstallLogicFunction` for best-effort cleanup of external resources when the app is uninstalled (deprovision API resources, delete remaining bots, revoke webhooks). Failures are logged and never block the uninstall.

Uninstall hook files live alongside other logic functions (typically `src/logic-functions/uninstall.ts`). Kebab-case filename, one export per file.

The hook runs before the app's metadata, data, and code are removed, so handlers can still query the app's objects and records. Handlers receive `UninstallPayload` (`{ version?: string }`).

## Health Check

Use `defineHealthCheck` to report whether the app is actually able to run. It covers what only the app can know: a key that is present but revoked, an account on the wrong plan, a webhook that was never registered. A required variable nobody filled in is already covered by `isRequired` and needs no code.

Health check files live alongside other logic functions (typically `src/logic-functions/health-check.ts`). Only one health check is allowed per app; declaring more than one fails the build.

The config takes `universalIdentifier` and `handler`. The handler takes no arguments and runs server-side, so it reads secret variables like any other logic function.

The handler returns `ApplicationHealthCheckResult`, a discriminated union:

- `{ status: 'OK' }`
- `{ status: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'NEUTRAL'; title: string; description?: string; action?: { label: string; location?: string } }`

The statuses come from `ApplicationHealthStatus`, exported from `twenty-sdk/define`, so `ApplicationHealthStatus.WARNING` and `'WARNING'` are interchangeable. `UNKNOWN` belongs to Twenty and an app cannot report it.

`title` and the optional `description` are the two lines of a banner on the app's settings page. `action` renders a button labelled `label` that redirects to `location`: a path inside Twenty such as `/settings/billing`, optionally with a hash to select a tab, or a hash alone such as `#variables` to move to a tab of the app's own settings page; omitting it lands on the app's Variables tab, or on its first settings menu item when the app declares no variables. The button is omitted when the location leaves Twenty, and when there is no location and neither of those to fall back to.

Twenty runs the check when the app's settings page opens and shows the result. Nothing is stored. A check that throws, times out, or returns a shape Twenty cannot read is treated as unknown, never as an error, and no banner is shown.
