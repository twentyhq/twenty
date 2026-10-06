# CLI app function execution

The command selects one deployed function from the
local app's identifiers, executes it once with a payload, and reports status,
duration, data, error and logs. Name matching is exact. Hooks select their
function identifier; executing an uninstall hook does not uninstall the app.
A non-SUCCESS result exits with failure. It executes deployed code, so local
edits must be synced with apply or dev first.

## Contract

- Flags follow the space-separated command surface and kebab-case convention:
  `app exec --name`, `--universal-identifier`, `--post-install`, `--pre-install`
  or `--uninstall-hook`. Exactly one selector is required.
- The CLI keeps no saved build manifest. It uses the `buildManifest`
  worker to load definitions with the app's authoring SDK, without bundling or
  typechecking. Worker output becomes diagnostics; credentials are not passed to it.
- Function selection checks both the local manifest identifiers and the remote
  installed application's ID. The `findOneApplication` lookup prevents
  copied or stale identifiers from selecting another installed app's function.
  This needs `APPLICATIONS` in addition to execution's `WORKFLOWS` permission.
- The current server requires a user-bound token for execution. Browser-login
  OAuth remotes are supported; API-key targets fail before loading app source.
  The server still decides which functions that user can run: workspace custom
  app functions, functions exposed as workflow actions, or functions from an
  app registered by this workspace. The CLI does not bypass those checks.
- Payloads use the JSON-object input reader: inline JSON, `@file` or
  `-` for stdin, default `{}`. Non-object values are rejected.
- Human output escapes terminal controls. JSON success includes function/app
  identity, status, `durationMilliseconds`, data, logs, error and diagnostics.
  A completed non-SUCCESS result exits 1 with `EXECUTION_FAILED` and retains
  that information in `error.details`, with `outcome: "completed"`. A missing
  function exits 4; ambiguous selection exits 6; bad input exits 2.
- The execution request deadline is the deployed function's `timeoutSeconds`
  plus the transport's 60-second allowance. Its HTTP dispatcher header/body
  deadlines use the same value, avoiding Node's default five-minute cutoff.
  Other commands use their own deadlines and lazy transport loading.
  Proxies and the server can still close a request earlier.
- Execution is never retried. Acknowledged authentication, permission,
  not-found and input/validation rejections have `outcome: "not-started"`.
  Transport failure, cancellation, internal server error or an invalid response
  after submission have `outcome: "unknown"`: execution may still be running.
  Ctrl+C exits 130 and cannot stop the server-side function or undo its effects.

Command tests use the public command runner and real HTTP metadata transport,
with controlled worker results. They cover selection, application binding,
payloads, returned errors, rejection/unknown outcomes, cancellation and no
replay. These tests do not establish live workspace authorization or execution.
