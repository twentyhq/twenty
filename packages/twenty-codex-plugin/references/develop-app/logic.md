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
