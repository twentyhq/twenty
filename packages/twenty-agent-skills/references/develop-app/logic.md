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

## Server Cron Trigger

Use `serverCronTriggerSettings` instead of `cronTriggerSettings` when every install calls the same third-party account (one key in `serverVariables`) and running once per workspace would multiply calls against the provider's rate limits. The function runs once per server per tick, in the app's owner workspace, and hands each workspace its share of the data.

- `serverCronTriggerSettings: { pattern: string }` takes exactly 5 cron fields, evaluated in UTC. The function cannot declare any other trigger.
- The handler (`ServerCronHandler`) receives `ServerCronPayload`: `{ scheduledAt, step, cursor? }`. Compute time windows from `scheduledAt`, which is the same for every step of a tick.
- It returns `ServerCronDispatchResult`: `{ dispatches: ServerCronDispatch[]; next?: { cursor; delayMs? } }`. Each dispatch is `{ workspaceId, targetLogicFunctionUniversalIdentifier, payload?, delayMs? }` and enqueues that target, a logic function of the same app, in that workspace.
- Return `next` to page through a large list in bounded steps instead of one long run. Limits: 1,000 dispatches per step, 100 steps per tick, 256 KiB per dispatch payload.
- Dispatches to workspaces without the app are dropped. Targets run at least once, so keep them idempotent, and only send a workspace its own data.
- Keep per-workspace settings (application variables) and record writes in the target, not in the dispatcher.
- Import the types from `twenty-sdk/define` or `twenty-sdk/logic-function`.

## Skills And Agents

Skills and agents should describe when they apply, what context they need, and what output is expected.

When adding AI behavior:

- Make trigger rules concrete.
- Keep instructions grounded in available app data and tools.
- State when the agent should ask for missing workspace or record context.
- Avoid exposing raw IDs, timestamps, or nested API output to end users when a readable answer is possible.

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
