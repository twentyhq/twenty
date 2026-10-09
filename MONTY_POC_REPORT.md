# Monty code mode POC: `run_tool_script`

Branch: `poc/monty-code-mode` (from `origin/main` at 626c9db0a6). Drop this file before any real PR.

## Summary

`run_tool_script` works. A model-style Python script runs in Monty, calls Twenty tools through one host function, `call_tool`, with the caller's `ToolContext`, and returns a computed result in one turn. The opportunity follow-up scenario runs in 55 ms over MCP with 4 tool calls. Escapes, limits, crashes and refusals all come back as tool errors, and the pool keeps serving afterwards. Permissions match `execute_tool` for both object-level refusal and row-level filtering.

Recommendation: **go for continued work behind the flag, no-go for production as is.** The blocker is the production image: `node:24-alpine` is musl and Monty ships no musl build. Details and options are at the end.

## What was built

Server code (all under `packages/twenty-server/src/engine/`):

- `core-modules/code-mode/code-mode.module.ts`: Nest module exporting `MontyPoolService`.
- `core-modules/code-mode/services/monty-pool.service.ts`: owns one lazy pool, created on first use, closed in `onModuleDestroy`. `runScript()` does one checkout per call, always closes the session, and maps every failure (load, checkout, Monty errors) to `{ success: false, error }`.
- `core-modules/code-mode/constants/monty-pool-options.constant.ts`: `maxProcesses: 4`, `checkoutTimeout: 10`, `requestTimeout: 60`.
- `core-modules/code-mode/utils/load-monty-module.util.ts`: the single place that loads `@pydantic/monty`, through a dynamic `import()` (see "Loading" below for why).
- `core-modules/code-mode/utils/format-monty-error.util.ts`: renders `MontyTypingError`, `MontySyntaxError`, `MontyRuntimeError` (full Python traceback), `MontyCrashedError` and `ProtocolError`.
- `core-modules/code-mode/utils/convert-monty-value-to-json.util.ts`: Python values reach the host as `Map`, `Set`, `bigint` and date markers. This turns them into JSON (dict to object, set and tuple to array, big int to string, `date`/`datetime` to ISO strings).
- `core-modules/code-mode/utils/create-script-output-collector.util.ts`: stdout and stderr capture, each capped at 32 KB with a `[output truncated]` marker.
- `core-modules/tool-provider/tools/run-tool-script.tool.ts`: `createRunToolScriptTool(toolRegistry, montyPool, context, { isToolAllowed })`, mirroring `execute_tool` (zod schema, `additionalProperties: false`).
- `core-modules/tool-provider/constants/run-tool-script-limits.constant.ts`: 64 MB, 30 s feed duration, 100 tool calls, 32 KB streams.
- `core-modules/tool-provider/tools/index.ts`: exports.
- `api/mcp/services/mcp-protocol.service.ts`, `api/mcp/mcp.module.ts`: tool added next to `execute_tool` when `IS_CODE_MODE_ENABLED`, same `isToolAllowed` (`MCP_EXCLUDED_TOOL_NAMES`), same annotations as `execute_tool`.
- `metadata-modules/ai/ai-chat/services/chat-execution.service.ts`, `ai-chat.module.ts`: same in chat, with `AI_CHAT_EXCLUDED_TOOL_NAMES`.
- `metadata-modules/ai/ai-chat/constants/chat-system-prompts.const.ts`, `utils/build-full-system-prompt.util.ts`: a short `CODE_MODE` section, added only when the flag is on.
- `packages/twenty-shared/src/types/FeatureFlagKey.ts`, `workspace-manager/dev-seeder/core/utils/seed-feature-flags.util.ts`: `IS_CODE_MODE_ENABLED`, seeded to `true`.
- `packages/twenty-server/package.json`, `yarn.lock`: `@pydantic/monty` pinned to `1.1.0`.

Tests:

- `core-modules/tool-provider/tools/__tests__/run-tool-script.tool.spec.ts`: 25 unit tests, real Monty pool, fake registry.
- `test/integration/ai/suites/utils/`: `make-mcp-request.util.ts`, `run-tool-script-through-mcp.util.ts`, `execute-tool-through-mcp.util.ts`, `list-mcp-tool-names.util.ts`.
- `test/integration/ai/suites/successful-run-tool-script.integration-spec.ts`
- `test/integration/ai/suites/failing-run-tool-script.integration-spec.ts` and its `__snapshots__` file
- `test/integration/ai/suites/run-tool-script-permission-parity.integration-spec.ts`
- `test/integration/ai/suites/run-tool-script-feature-flag.integration-spec.ts`

### `call_tool` behaviour

- Refused without executing: anything `isToolAllowed` rejects, `run_tool_script`, `execute_tool`, `code_interpreter`, and any catalog entry with `approval` set. A refusal raises in Python, so `try/except` can handle it.
- Otherwise `toolRegistry.resolveAndExecute(name, args, context, { compactOutput: false })`. `success: false` raises `RuntimeError: Tool "x" failed: <tool error>`. Success returns `result`.
- The 101st call raises. Catalog lookups for the approval check are cached per script.
- Both `call_tool(name, args)` and keyword calls `call_tool(name=..., args=...)` work.
- Output: `{ success, message, result, stdout, stderr, toolCalls: [{ name, success }], warnings?, error? }`.

### Where I deviated from the brief, and why

1. **`compactOutput: false` inside scripts** (commit 68f140320d). With compaction on, `stripEmptyValues` removes empty arrays and null fields. A `find_many_*` with no match came back as `{count: "0", hasNextPage: false}`, without `records`, so `page["records"]` raised `KeyError`. The same happened for `record["ownerId"]` on an unowned opportunity. This hit me three times in local runs, including the cleanup script on the old build. Compaction exists to save model tokens, and tool results inside a script never reach the model, so it only cost correctness. A regression test covers it; I checked it fails with compaction back on. One revertable commit if you disagree.
2. **Tool `warnings` are passed through** (commit 2321438e03). A `select` on a field that does not exist (`city` on person) only warns. `call_tool` returned `result` alone, so my pagination script reported "1200 people, all without a city" as a success. The script output now carries `warnings: ["find_many_people: Field 'city' not found on person."]`.
3. **Concise type check diagnostics** (commit 4683093ae9). The default `full` format renders code frames and a "Python 3.14 was assumed" note. A two-error type failure went from about 1.2 KB to 250 bytes.
4. **Lazy `import()` instead of a top-level import.** `require(esm)` works on Node 24 (checked), but the package loads its native binding at import time and throws `Cannot find native binding` where none exists, which is the case on musl. A top-level import would stop the whole server from booting on Alpine. With the lazy load, the server boots and only `run_tool_script` fails, cleanly (verified, see "musl").
5. **The prompt paragraph is a separate, flag-gated section** (`CHAT_SYSTEM_PROMPTS.CODE_MODE`) instead of text inside `BASE`. Putting it in `BASE` would tell the model about a tool it does not have when the flag is off. `SystemPromptBuilderService` (the prompt preview) does not pass the flag, so the preview omits it.
6. Spec file names: the brief only fixed `successful-*` and `failing-*`; parity and flag-off live in `run-tool-script-permission-parity` and `run-tool-script-feature-flag`.

## Test results

Unit specs:

```
npx jest packages/twenty-server/src/engine/core-modules/tool-provider/tools/__tests__/run-tool-script.tool.spec.ts \
  packages/twenty-server/src/engine/core-modules/tool-provider/tools/__tests__/execute-tool.tool.spec.ts \
  packages/twenty-server/src/engine/metadata-modules/ai/ai-chat/utils/__tests__/build-full-system-prompt.util.spec.ts \
  packages/twenty-server/src/engine/api/mcp/controllers/__tests__/mcp-core.controller.spec.ts \
  --config=packages/twenty-server/jest.config.mjs

PASS .../run-tool-script.tool.spec.ts
    ✓ chains tool calls, aggregates in Python and returns a dict
    ✓ accepts keyword arguments and converts values JSON cannot hold
    ✓ passes tool warnings on instead of dropping them
    ✓ raises once a script exceeds the tool call cap
      ✓ raises an exception the script can catch
      ✓ fails the script with the tool error when not caught
      ✓ refuses an excluded tool / a tool that supports approval / run_tool_script itself / execute_tool / code_interpreter
      ✓ blocks open / os.environ / os.getenv / socket / subprocess / __import__ / /proc/self/environ
      ✓ blocks a file read at runtime too, past the type checker
      ✓ stops an endless loop at the duration limit and keeps serving
      ✓ stops a huge allocation at the memory limit and keeps serving
      ✓ survives a worker crash mid-script
      ✓ truncates long stdout
      ✓ reports a syntax error
      ✓ reports a type error before running
PASS .../execute-tool.tool.spec.ts, build-full-system-prompt.util.spec.ts, mcp-core.controller.spec.ts
Tests:       46 passed, 46 total
Time:        5.548 s
```

The escape tests assert the specific sandbox error (for example `PermissionError` or `unresolved-import`), not just `success: false`. My first version passed vacuously while the sandbox failed to load at all, so they now check the reason. The crash test `pkill -9`s the worker processes from inside a host call. The fake secret test sets `process.env.TWENTY_RUN_TOOL_SCRIPT_FAKE_SECRET` and checks it is absent from every output.

Integration specs (they boot the app in-process, so they also prove Monty loads inside the server):

```
cd packages/twenty-server
NODE_ENV=test NODE_OPTIONS="--max-old-space-size=6144" npx jest \
  test/integration/ai/suites/successful-run-tool-script.integration-spec.ts \
  test/integration/ai/suites/failing-run-tool-script.integration-spec.ts \
  test/integration/ai/suites/run-tool-script-permission-parity.integration-spec.ts \
  test/integration/ai/suites/run-tool-script-feature-flag.integration-spec.ts \
  --config=jest-integration.config.ts --ci

PASS successful-run-tool-script.integration-spec.ts
    ✓ creates a follow-up task for each opportunity closing this month without one (162 ms)
    ✓ hands scripts empty lists and null fields as they are (46 ms)
PASS failing-run-tool-script.integration-spec.ts (30.889 s)
    ✓ returns a tool error for a file read through open / a file read the type checker cannot see /
      reading the environment / reading /proc/self/environ / importing socket / importing subprocess /
      importing through __import__ / an allocation over the memory limit / an endless loop (30047 ms) /
      a tool excluded from MCP / code_interpreter / a nested run_tool_script / a tool that supports approval /
      a syntax error / a type error
    ✓ keeps serving scripts after every failure
PASS run-tool-script-permission-parity.integration-spec.ts
      ✓ refuses the unreadable object with the same error
      ✓ returns the same records for the readable object
      ✓ filters the hidden record out of both
PASS run-tool-script-feature-flag.integration-spec.ts
    ✓ is listed when the flag is on
      ✓ is not listed
      ✓ cannot be called
Tests:       24 passed, 24 total
Snapshots:   15 passed, 15 total
```

Notes on the integration specs:

- The scenario spec creates 3 opportunities closing this month (owners Tim, none, Jony) and one task with a task target on the first, all through `execute_tool`. The script is the model-style one: date window, `find_many_task_targets` with `targetOpportunityId in [...]`, set difference, `create_many_tasks` with `assigneeId` from `ownerId` when set, then `create_many_task_targets`. Then `find_many_tasks` and `find_many_task_targets` confirm exactly 2 tasks, the right titles, the right assignee (Jony and null), and the right links. It filters on a per-run name prefix so seeded opportunities are left alone.
- `expectOneNotInternalServerErrorSnapshot` does not apply: a refused script is a JSON-RPC result with `isError: true`, not a GraphQL error. The failing spec asserts there is no JSON-RPC `error` and snapshots the normalized script error instead (durations and byte counts masked). It also checks `APP_SECRET` and `PG_DATABASE_URL` never appear in the output.
- Permission parity: a role with `canReadAllObjectRecords: false` that can read people but not companies is given to Jony. `execute_tool find_many_companies` fails (the tool is not in that role's catalog), and the script's error contains exactly `Tool "find_many_companies" failed: <the execute_tool error>`. People reads return identical ids both ways. For row level, the existing company-name RLS role plus a visible and a hidden company: both paths return only the visible id.
- The endless loop case costs 30 s because it runs at the real 30 s limit.

Other checks:

```
npx tsgo -p tsconfig.json --noEmit           (packages/twenty-server)  -> no errors
npx nx lint:diff-with-main twenty-server     -> Found 0 warnings and 0 errors; All matched files use the correct format.
```

`tsgo` needed `twenty-emails` built first (unrelated `twenty-emails` export errors otherwise), and the MCP controller spec needed `twenty-client-sdk` built.

## Local run

Postgres 16 and Redis were already running (Homebrew) on this machine, so I did not run `setup-dev-env.sh`. I reset and seeded the `test` database with `NODE_ENV=test npx nx database:reset twenty-server`, built with `nest build`, and ran `NODE_ENV=test NODE_PORT=3010 node dist/main.js` so nothing touched the dev `default` database. Server logs showed no Monty startup errors; Monty does not load at boot at all, by design. The only errors were ClickHouse connection refusals (no ClickHouse here) and one tool error from my own bad filter.

### The opportunity scenario over `/mcp`

Request (`code` is the scenario script, the same one the integration spec uses, scoped by name prefix):

```
curl -s -X POST http://localhost:3010/mcp \
  -H "Authorization: Bearer $API_KEY_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  --data '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"run_tool_script","arguments":{"code":"import datetime\n\ntoday = datetime.date.today()\nmonth_start = today.replace(day=1)\nnext_month_start = (month_start + datetime.timedelta(days=32)).replace(day=1)\n\nopportunities = await call_tool(\"find_many_opportunities\", {\n    \"select\": [\"id\", \"name\", \"ownerId\", \"closeDate\"],\n    \"and\": [\n        {\"closeDate\": {\"gte\": month_start.isoformat() + \"T00:00:00Z\"}},\n        {\"closeDate\": {\"lt\": next_month_start.isoformat() + \"T00:00:00Z\"}},\n    ],\n    \"name\": {\"startsWith\": \"Code mode local\"},\n    \"limit\": 100,\n})\n... (trimmed: find_many_task_targets, set difference, create_many_tasks, create_many_task_targets)\n{\"createdTaskIds\": created_task_ids, \"opportunityIds\": [record[\"id\"] for record in uncovered]}\n"}}}'
```

Response (HTTP 200 in 0.055 s; the `text` field unpacked):

```json
{
  "success": true,
  "message": "The script ran 4 tool call(s)",
  "result": {
    "createdTaskIds": ["b3baef4f-9f13-4164-9492-fe221fa2b577", "ad120179-a127-4a37-a1be-0576262903ea"],
    "opportunityIds": ["7c2fd97b-a56f-4189-a72a-f7eed0b6c640", "bcd904a1-d8a2-480c-848d-80be2b632d50"]
  },
  "stdout": "3 opportunities closing this month, 2 without a task\n",
  "stderr": "",
  "toolCalls": [
    {"name": "find_many_opportunities", "success": true},
    {"name": "find_many_task_targets", "success": true},
    {"name": "create_many_tasks", "success": true},
    {"name": "create_many_task_targets", "success": true}
  ]
}
```

Running the same script again created nothing ("3 opportunities closing this month, 0 without a task"). Without the name prefix, against the whole seeded workspace, it found 35 opportunities closing this month, 32 without a task, and created 32 tasks plus targets in 97 ms with 4 tool calls. I soft-deleted everything I created afterwards with `delete_many_*`, from a script.

### Five model-style scripts

No AI provider key is available here (only `ANTHROPIC_BASE_URL` is set, no key, and the dev `.env` has none), so the chat flag-on/flag-off comparison did not run. Instead I wrote five scripts the way a model plausibly would after `learn_tools`, ran them over MCP, and kept every failure.

| Script | Attempts | Tool calls | Time | Failures before success |
| --- | --- | --- | --- | --- |
| 1. Aggregation: pipeline by stage and top 3 companies, paginated | 1 | 3 | 148 ms | none |
| 2. Bulk update: append the owner's first name to opportunity names | 4 | 3 | 37 ms | see below |
| 3. Dedup: companies with the same domain or normalized name, paginated over 599 companies | 1 | 6 | 67 ms | none |
| 4. Pagination: people per city over 1200 people | 2 | 12 | 89 ms | silent wrong answer (see below) |
| 5. Opportunity follow-up scenario | 2 | 4 | 71 ms | Twenty filter shape |

Failures in detail:

- Script 5, attempt 1: `{"closeDate": {"gte": ..., "lt": ...}}` fails with `Filter for field "closeDate" must have exactly one operator`. Twenty API shape; fixed with `and: [...]`.
- Script 2, attempt 1: `update_one_opportunity` refused, because it carries `approval` (see security notes).
- Script 2, attempt 2: `KeyError: ownerId` on the unowned opportunity, caused by compaction. Now fixed by the uncompacted results commit.
- Script 2, attempt 3: `upsert_many_opportunities` returns `{records, created, updated, total}` while `create_many_*` returns a bare list; `record["id"] for record in updated` raised `TypeError`. **The upsert had already been applied**, so the script failed after its writes landed.
- Script 2, attempt 4: `updated = await call_tool(...) if changes else []` followed by `updated["records"]` is rejected by the type checker (`Any | list[Unknown]` cannot be indexed by a string), although it is correct at runtime. Restructured.
- Script 4, attempt 1: `city` does not exist on person. The tool only warned, `call_tool` dropped the warning, and the script "succeeded" with every person in "(none)". Now fixed by the warnings commit; the output carries the warning.

**No failure in these runs came from the Monty Python subset.** Everything the scripts used worked on the first try: f-strings, comprehensions with `**` dict unpacking, `defaultdict`, `Counter.most_common`, `sorted` with lambda keys, `re.sub` with `\b`, `datetime` arithmetic, `while` pagination, closures, walrus, `@dataclass`, `zip`, `enumerate`, `print(..., file=sys.stderr)`. The friction came from the tool surface: filter shapes, inconsistent result shapes, compaction, dropped warnings, and `count` coming back as a string (`"1200"`), which makes `page["count"] > 0` a `TypeError`.

## Measurements

macOS arm64, Node 24.5.0, Monty 1.1.0 native build. Scratch benchmarks, not committed.

Pool and session, standalone Node process:

| What | Value |
| --- | --- |
| Module load, very first run on this machine (cold disk, first exec of the binary) | 376 ms |
| First checkout, very first run (worker spawn) | 423 ms |
| Module load, later runs | 17 ms |
| `Monty.create` | 0.7 ms |
| First checkout, later runs (worker spawn) | 12.6 ms |
| First type-checked feed in a new worker | 6.3 ms |
| Warm checkout | p50 0.03 ms, p95 0.14 ms (n=200) |
| Trivial feed with type check | p50 0.06 ms |
| Scenario script with 4 no-op host calls, type check on / off | p50 0.42 ms / 0.32 ms |
| Host call round trip, from 100 sequential no-op calls | about 0.035 ms per call |
| 100 gathered host calls of 5 ms each | 8.9 ms total (they really run concurrently) |
| 5th concurrent checkout with `maxProcesses: 4` | rejected after the 10 s `checkoutTimeout` |
| Memory | host process +16 MB for 2 warm workers; each worker process about 21 MB RSS |

In the server, over MCP on localhost (medians):

| What | Value |
| --- | --- |
| First `run_tool_script` after boot (lazy load, pool, spawn, tool call) | 109 ms and 147 ms on two boots |
| `execute_tool` with one `find_many_companies` | 6.9 ms per call |
| `run_tool_script` with no tool call | 3.7 ms |
| `run_tool_script` with 20 sequential `call_tool` | 47.8 ms, so 2.2 ms per call |
| `run_tool_script` with 20 gathered `call_tool` | 24.5 ms |
| 20 `execute_tool` calls back to back | about 138 ms, before counting the 20 model turns between them |

The 2.2 ms per `call_tool` is almost all `resolveAndExecute` (it rebuilds the tool catalog on every call, then queries Postgres). Monty's share is about 0.035 ms. The real saving is the model turns, which this setup cannot measure without a provider key.

## Alpine / musl

- Docker is installed but the daemon was not running, and I did not start Docker Desktop on your machine unattended, so I could not load the module in `node:24-alpine`. The production image is `node:24.19.0-alpine3.23` (`packages/twenty-docker/twenty/Dockerfile`).
- From npm: `@pydantic/monty-linux-x64-musl`, `-linux-arm64-musl` and `-wasm32-wasi` do not exist (404). `@pydantic/monty-linux-x64-gnu` declares `libc: glibc`, so Yarn will not install it on Alpine. On top of the `.node` binding, the package also needs the `monty` worker executable, which is glibc-linked too.
- `native-addon.js` detects musl correctly but then has nothing to load, and throws `Cannot find native binding` at import time.
- I simulated that in the real server with `NAPI_RS_NATIVE_LIBRARY_PATH=/nonexistent/monty.node`. The server booted, `execute_tool` worked, and `run_tool_script` returned `success: false` with `The script sandbox is unavailable: Cannot find native binding. ...`. The tool is still listed in that state, which is wrong for real use: it should only be offered when the sandbox can load.

`@pydantic/monty/wasm` under Node works:

- Same pool API. Host functions, `asyncio.gather`, type checking, `PermissionError` on file reads, `os.environ` refusal, the memory limit and the duration limit all behave like the native build, and the pool serves the next call after limit hits.
- Startup: module load 30 ms, `Monty.create` 82 ms, first feed 163 ms (wasm compile and checker warm-up). Host call round trip about 0.058 ms.
- Cost: it runs in worker threads inside the server process, about 77 MB RSS per worker (2 warm workers took the process from 43 MB to 197 MB, against 59 MB for native). The package carries a 22 MB wasm component. It also loses the crash isolation of a separate OS process and the cleared environment (see below).

## Jest and ESM

- Out of the box Jest fails on the package: `SyntaxError: Unexpected token 'export'`.
- Adding `@pydantic` to the `transformIgnorePatterns` exceptions, as the brief suggested, does not work. SWC transpiles it, but `native-addon.js` declares `const __dirname`, which collides with the CommonJS wrapper: `SyntaxError: Identifier '__dirname' has already been declared`. It also relies on `import.meta.url`. I reverted that change.
- `createRequire` does not escape Jest either: jest-runtime patches `module.createRequire` to return its own require.
- What works: the unit spec mocks the single loader (`load-monty-module.util.ts`) with `process.getBuiltinModule('node:module').createRequire(__filename)('@pydantic/monty')`, which is Node's real require and does `require(esm)` natively.
- Second trap, cross-realm objects: Monty only converts objects whose prototype is its own realm's `Object.prototype` or `null`. Objects created in the Jest sandbox realm fail with `TypeError: Cannot convert Object instance to a Monty value`. The spec turns fake tool results into null-prototype objects. In production code I used `util.types.isMap`/`isSet` instead of `instanceof` in the converter so it works across realms.
- Integration tests need no Jest change: the app is created in `globalSetup`, which runs in the main realm with Node's own require.
- `jest.config.mjs` enables fake timers globally; the spec switches to real timers.

## Security observations

1. **The worker gets an empty environment.** I pointed `MONTY_BIN` at a wrapper that dumps `env` and then execs the real binary: the worker started with only `PWD`, `SHLVL` and `_` (set by the shell wrapper itself). None of the server's secrets reach the worker process, which also makes the pure-Python escape attempts moot even if the sandbox had a hole. This does not hold for the wasm build, which runs in a worker thread of the server process.
2. **Two layers block escapes.** The type checker rejects `open`, `__import__`, `globals`, `socket`, `subprocess`, `importlib`, `ctypes` before anything runs. At runtime, with the checker bypassed (`eval('open')`, or with `typeCheck: false`), the same attempts fail with `PermissionError` or `ModuleNotFoundError`, and `os.environ`/`os.getenv` raise `not supported in this environment`. PEP 723 `# /// script` dependency headers do nothing in the pure Monty worker.
3. **Permission parity holds** for object-level refusal and row-level filtering, because `call_tool` goes through the same `resolveAndExecute` with the same context.
4. **`approval` is not a gate today.** It is a template that tells `propose_tool_call` how to render a proposal, and `execute_tool` runs those tools without asking anyone. It is set on every `create_one_*`, `update_one_*` and `delete_one_*`, plus `send_email` and `draft_email`, but not on the `*_many_*` variants. So refusing `approval` tools in scripts blocks single-record writes while `create_many_*`, `update_many_*`, `upsert_many_*` and `delete_many_*` stay callable. The refusal message points the model to the `*_many_*` tool, which worked in script 2.
5. **Scripts remove the model turn between reading and sending.** In chat, `http_request` is allowed (it is excluded only on MCP), so a prompt-injected script could read CRM data and post it out up to 100 times in one turn. `execute_tool` has the same capability, but one call per model step. I would exclude outbound tools from scripts by default.
6. **No wall-clock budget.** `maxFeedDurationSecs` counts sandbox execution only, not time suspended in host calls, so 100 slow tool calls are not bounded by it. `requestTimeout: 60` is a per-turn backstop for a wedged worker, not a script budget.
7. **No host-side concurrency cap.** `asyncio.gather` over 100 calls starts 100 `resolveAndExecute` at once against Postgres.
8. **No transaction.** A script that fails after a write leaves the write in place (script 2, attempt 3). The model may retry and apply it twice unless the script is idempotent.
9. **`call_tool` does not validate arguments against the tool schema**, like `execute_tool`. `create_many_tasks` documents "Maximum 20 records per call" and accepted 32 from a script.
10. Pool size is per server instance: with `maxProcesses: 4`, the fifth concurrent script waits 10 s and then fails with `no monty worker became available within the checkout timeout`.
11. The binary resolution order trusts `MONTY_BIN`, then the platform package, then `PATH`. Passing an explicit `binaryPath` would remove the `PATH` fallback. `NAPI_RS_NATIVE_LIBRARY_PATH` similarly redirects the native addon. Both need control of the server environment, so low risk.
12. Output size: stdout, stderr and the error are capped at 32 KB, but `result` is not, and unlike `execute_tool` in chat it is not spilled to storage. The tool description asks for small results; a cap or spill is still missing.

## What could not run here

- **Cloud environment**: this ran on your Mac (macOS arm64) in a worktree, not in a cloud box. Postgres and Redis came from Homebrew and were already up.
- **Alpine in Docker**: Docker daemon not running; replaced by npm metadata and a simulated missing binding in the real server.
- **Chat flow with a real model**: no provider key; replaced by five hand-written scripts. So tokens, turns and model retries flag-on versus flag-off are not measured.
- **ClickHouse**: not running; only log noise.
- Frontend: I did not add the flag to `SettingsAdminFeatureFlagMetadata.ts` or regenerate the GraphQL types, so the admin panel will not list `IS_CODE_MODE_ENABLED` until codegen runs.

## Other gaps worth knowing

- `run_tool_script` output has no `recordReferences`, so chat cannot render record chips for what a script created or found.
- The tool is listed even when the sandbox cannot load (musl). It should check availability first.
- In MCP direct mode, `run_tool_script` stays listed next to the native tools while `learn_tools` is hidden; its description still says to call `learn_tools` first.
- `resolveAndExecute` rebuilds the tool catalog on every call. Inside a script that could be cached once per run.

## Recommendation

**Go, behind the flag, for MCP and chat experimentation. No-go for production until the musl question is settled.**

The core assumptions held: Monty loads in the server through `require(esm)`, isolation is good (separate process, empty environment, two blocking layers), overhead is negligible next to tool execution, limits and crashes are contained, and permissions match `execute_tool`. The Python subset was not what broke; the tool surface was.

Top 3 open questions:

1. **Alpine.** Move the server image to a glibc base such as `node:24-bookworm-slim`, ship the wasm build on musl (about 77 MB per worker in-process and no crash isolation), or wait for upstream musl builds?
2. **Which tools may a script call?** The `approval` rule blocks single-record writes but not bulk ones, and it does not cover outbound tools like `http_request` in chat. A script-specific allow or deny list is probably better than reusing `approval`.
3. **Limits under real load.** We need a wall-clock budget per script, a cap on concurrent `call_tool`s, a pool size per instance (4 workers per server today), and a stance on partial writes (idempotency guidance in the prompt, or a dry-run mode).
