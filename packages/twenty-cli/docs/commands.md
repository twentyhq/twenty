# Command reference

For available commands and flags, run `twenty commands` or
`twenty <command> --help`. This reference describes behavior, permissions and
failure recovery. See the [README](../README.md) to build and start the CLI.

- [Connections and authentication](#connections-and-authentication)
- [Raw API requests](#raw-api-requests)
- [Network proxies](#network-proxies)
- [Doctor](#diagnose-your-setup)
- [Open](#open-the-workspace)
- [Metadata](#inspect-the-data-model)
- [Records](#read-records)
- [App init](#create-an-app) and [add](#add-definitions-to-an-app)
- [Build and typecheck](#build-and-check-an-app)
- [Plan](#preview-app-changes), [apply](#apply-an-app) and [dev](#develop-an-app)
- [Pull](#pull-an-app) and [uninstall](#uninstall-an-app)
- [Function execution](#execute-an-app-function) and [logs](#watch-app-logs)
- [Expired browser sessions](#expired-browser-sessions)
- [Output and exit codes](#output)

## Connections and authentication

```bash
twenty auth login --url https://acme.twenty.com
twenty auth status
```

The connection is named `default` when neither `--name` nor `--remote` is supplied.
Run `twenty auth login` again to sign in to that saved URL. To keep several
connections, give each a name:

```bash
twenty auth login --url https://acme.twenty.com --name dev --use
twenty auth status --remote dev
twenty remote list
twenty remote use dev
```

A remote is a named workspace connection. Browser login requires an interactive
terminal and saves a user OAuth session after verifying it with the server.
Workspace commands do not require an app project or register an application in
that workspace. Application deployment is a separate operation.

For scripts, pass an API key through standard input:

```bash
printf '%s' "$TWENTY_API_KEY" | twenty auth login --with-token --url https://acme.twenty.com --name ci
```

Credentials and remote settings are saved in `~/.twenty/config.json`, with
owner-only file permissions. Login validates credentials before saving them.
`--use` makes the remote the default; the first remote also becomes the default.
Creating the connection named `default` does not switch an existing default
remote unless you pass `--use`.
Use `twenty auth login --remote dev` to sign in again to a saved URL. Changing an
existing remote's URL requires `--replace`.

Commands select a workspace in this order:

1. `--remote <name>`, ignoring environment target settings with a warning.
2. `TWENTY_REMOTE`, which cannot be combined with either API environment variable.
3. `TWENTY_API_URL` and `TWENTY_API_KEY`, which must both be set and are not saved.
4. The saved default remote.

```bash
twenty remote rename dev development
twenty auth logout --remote development
twenty remote remove development
```

Logout forgets saved credentials but keeps the remote. Removing a remote deletes
both. Neither command revokes the server-side credential. `twenty auth token`
prints the selected credential for use in another tool; its output is a secret,
including in JSON mode.

`--no-input` disables prompts and browser opening. JSON/NDJSON output, redirected
stdin and CI also disable interaction. Pass required values and explicit
command-specific approvals, such as `app apply --create` or `--yes`, in scripts.
Disabling prompts does not approve an operation.

## Raw API requests

```bash
twenty api rest '/rest/companies?limit=5'
twenty api graphql --query '{ companies(first: 2) { edges { node { name } } } }'
twenty api graphql --metadata --query '{ currentWorkspace { displayName } }'
```

Both commands use the selected connection without an app project. REST paths
stay inside its API URL; credentials are not sent to an arbitrary host. REST
uses GET by default. `--body` accepts JSON inline, `@file.json`, or `-` for stdin
and requires an explicit `--method`.

```bash
twenty api rest /rest/companies --method POST --body '{"name":"Example"}'
twenty api graphql --query @query.graphql --variables @variables.json
```

GraphQL uses the core endpoint by default and the metadata endpoint with
`--metadata`. `--query` accepts a document inline, `@file.graphql` or `-`;
`--variables` accepts a JSON object through the same input forms. Only one option
can read stdin. Mutations and REST writes execute directly, without the app
plan/apply confirmation flow. Server permissions still apply.

Human output displays the response body. In JSON mode, REST returns status,
selected response headers and body in `data`; GraphQL returns its data there.
HTTP and GraphQL errors use the standard error envelope. Responses are bounded
by the transport's 16 MiB limit; raw requests do not paginate automatically.

## Network proxies

API requests, browser sign-in requests and app uploads honor `HTTP_PROXY`,
`HTTPS_PROXY` and `NO_PROXY` (also their lowercase equivalents, which take
precedence). `HTTP_PROXY` also covers HTTPS when `HTTPS_PROXY` is unset.
Use `NO_PROXY=localhost,127.0.0.1` to bypass a proxy for local development,
or `NO_PROXY=*` to bypass it for all hosts. Proxies must support HTTP CONNECT.
For a corporate certificate authority, set `NODE_EXTRA_CA_CERTS` before starting
the CLI. TLS certificate verification stays enabled.

## Diagnose your setup

```bash
twenty doctor
twenty doctor --remote staging --path ./my-app --json
twenty doctor --offline
```

`doctor` checks the running CLI and Node version, executable ownership and precedence on PATH, configuration, the selected connection, and an app's installed SDK authoring exports. It works without an app or saved remote; unavailable optional checks are marked `skipped`. Use `--path` to require a specific app. PATH inspection does not execute binaries or inspect shell aliases, functions or command caches; package-manager wrappers whose owner cannot be determined are reported as unknown.

By default it sends one read-only request to the selected workspace's metadata endpoint to check access. This does not prove access to every object or app operation. `--offline` disables network requests. Doctor never imports app or SDK code, builds an app, installs packages, repairs files, or refreshes credentials. An expired OAuth access token skips the network check: it produces a warning when a refresh token is saved (renewal remains unverified), or a failure when there is none. Renew through `twenty auth status` for the same remote, or sign in again.

Each check has an `id`, `status` (`pass`, `warning`, `fail`, or `skipped`), message, and optional code, hint and details. Failed checks exit 1 with `DOCTOR_FAILED`; JSON includes the checklist in `error.details.checks`. Otherwise exit 0, with the same checklist in `data.checks`, including warnings and skipped checks. Human output includes the full checklist in either case. Ctrl+C exits 130. Output omits credentials, server response bodies and user identity information, but includes local paths and the selected API URL.

## Open the workspace

```bash
twenty open
twenty open settings/applications
twenty open --remote staging --url-only --json
```

`open` asks the selected workspace for its web address, which is its custom domain when one is enabled and its subdomain otherwise. It then opens that address, or a page inside it, in your default browser. The address carries no credentials, so sign in to the workspace in the browser if needed. A browser only opens in an interactive terminal: with `--no-input`, JSON output, redirected stdin or in CI, the command stops with `USAGE` (exit 2) unless `--url-only` is set, which prints the address instead. A page is a path inside the workspace; one that would lead to another site is refused with `USAGE`.

If the workspace returns no web address, `open` uses the frontend origin from
the server's OAuth discovery document. It drops the authorization path, query,
fragment and any URL credentials. Invalid addresses and failed metadata
authentication still stop the command.

## Inspect the data model

```bash
twenty metadata object list
twenty metadata object describe companies
twenty metadata field list companies --all
twenty metadata field describe companies tier --json
```

Object arguments accept exact, case-sensitive singular or plural API names. Field arguments accept exact API names. Labels are never matched, and ambiguous names fail with `AMBIGUOUS_RESOURCE` (exit 2). Missing names return `NOT_FOUND` (exit 4).

Object describe shows object properties. Use field list to inspect its fields; system fields are hidden unless `--all` is present. Field describe can inspect a named system field directly. Each field reports its own owner, independently of its object. If application names cannot be read, Custom remains identifiable and other owners are reported as unknown with a warning; ownership is not a permission check.

Inspection reads every metadata page before resolving names, so a match on an early page cannot hide an ambiguity on a later one. Each object/field traversal is capped at 10,000 items or 16 MiB of node data; exceeding either limit fails instead of returning incomplete metadata. Requests use the selected connection and fetch live metadata on every invocation. Human output shows labels, constraints, options and relationships; JSON also preserves IDs, universal identifiers, settings and relationship endpoints.

## Read records

```bash
twenty data list companies --limit 20
twenty data list companies --filter 'employees[gte]:5000' --order-by 'employees[DescNullsLast]'
twenty data get people <id> --json
twenty data list people --all --format ndjson
```

These commands resolve the same exact singular/plural API names as metadata inspection, including custom objects, and reuse the selected connection. They require access to object metadata as well as the records. `data get` reads one record with one level of related records; it does not recursively expand or paginate relations.

`data list` reads one page by default, with a default `--limit` of 50 and a maximum of 200. `--cursor` passes the opaque REST `starting_after` cursor. `--filter` and `--order-by` pass REST expressions unchanged; server ordering and its ID tie-breaker are preserved. Every result includes page information, and human output shows a next-page command. Pagination is not a database snapshot; concurrent writes can change results or totals during traversal.

`--fields name,employees` selects human table columns only. Tables shorten cells longer than 60 characters and display absent values as `-`. JSON and NDJSON retain full records, including composite values and relation identifiers.

`--all` reads every remaining page, including when starting from `--cursor`. Human/JSON results are limited to 10,000 records and 16 MiB of serialized payload; human tables are also bounded. Exceeding a limit returns `RESULT_LIMIT_EXCEEDED` (exit 2), with no partial success. Every HTTP response is separately limited to 16 MiB, including in NDJSON mode.

Use explicit `--format ndjson` for larger traversals. It emits numbered `start`, `record`, page `progress`, and terminal `result`/`error` events, reading one page at a time and waiting for stdout when the reader is slow. `resumeCursor` advances only after a complete page has been written. After a partial page or a failure, resume with the last reported cursor and the same filter/order; records from the partial page may repeat. With no completed page, use the original cursor or restart without one. A stream without a terminal event is incomplete. Without `--all`, NDJSON still reads only one page.

## Create an app

```bash
twenty app init my-app
twenty app init billing --path ./apps/billing --display-name Billing --json
```

`app init` creates a new app from the template bundled with the CLI, with fresh universal identifiers and `twenty-client-sdk`, `twenty-sdk` and `twenty-ui` pinned to the exact version the CLI was built with. It needs no installed SDK, saved remote or network access, and it only writes files: it does not install dependencies, create a Git repository, start a server, sign in or sync anything. The next steps it prints, and returns as `data.nextSteps` in JSON, cover the rest, and name the remote when you pass `--remote`.

The name must be a valid npm package name, otherwise the command fails with `INVALID_APP_NAME` (exit 2). The app is created in `./<name>` unless `--path` says otherwise; `--display-name` and `--description` set what Twenty shows. The target must not exist yet or be an empty directory; anything else fails with `APP_PATH_UNAVAILABLE` (exit 6) and nothing is written. The template is rendered in a hidden sibling directory and moved into place only after every placeholder was filled, so a failure or Ctrl+C does not leave a half-created app behind. An existing empty directory is filled with create-only writes, so a file that appears there meanwhile is never overwritten.

New apps declare `engines.twenty` as `>=` the template release version. The server
checks this range against the workspace's completed upgrade version on apply.
Upgrade the workspace before deploying a newer template, including during local
development. Adjust the range only after testing the app against older versions.

The integration tests of a new app run against a workspace through this CLI.
`src/__tests__/global-setup.ts` uninstalls any previous copy, runs
`twenty app apply --create` before the tests and `twenty app uninstall --yes`
after them, through `src/__tests__/run-twenty.ts`. That helper runs `twenty` with
`--json`, returns its result, and passes its progress through. It skips the
binaries a package manager puts first on `PATH` inside `yarn test`, so the
globally installed CLI runs; set `TWENTY_CLI` to use another executable.
Credentials come from `TWENTY_API_URL` and `TWENTY_API_KEY`,
which the template's Vitest config sets.

## Add definitions to an app

```bash
twenty app add
twenty app add object --name invoice --name-plural invoices --no-input
twenty app add field --name amount --type NUMBER --object <object-universal-identifier> --json
twenty app add logic-function --name send-invoice --no-input
twenty app add front-component --name invoice-panel --no-input
```

`app add` creates one standalone definition from the CLI's templates.
It discovers the containing app, or accepts `--path <app-directory>`. No sign-in
or workspace connection is needed. Use `object`, `field`, `logic-function` or
`front-component`; other generators and optional object views, layouts and menu
companions are not supported.

Files are created under `src/objects`, `src/fields`, `src/logic-functions` and
`src/front-components`, with kebab-case filenames and fresh universal UUIDs.
Existing files are never replaced, including filename collisions after case
normalization. Symlinked destination paths are refused. Both cases exit 6.
JSON returns app-relative paths in `data.createdPaths`.

Omitted values are prompted only in a human interactive terminal. With `--json`,
`--no-input`, redirected stdin or CI, required values must be supplied explicitly
or the command exits 2 before creating files. Labels default to the name; fields
default to `TEXT`. `--object` requires the parent's universal identifier, not its
workspace database ID. Relations additionally require `--target-object` and
`--target-field`; `--relation-type` defaults to `ONE_TO_MANY` and `--on-delete`
to `CASCADE`. The command does not create the reverse field or
check that these identifiers exist in a workspace.

Review the generated definition and its type-specific settings, then run
`twenty app build` and `twenty app plan`. Generation does not install or apply
anything. Cancellation before the file is created exits 130; existing app files
stay untouched, although empty parent directories can remain.

## Build and check an app

```bash
twenty app build
twenty app typecheck
twenty app build --path ./apps/billing --json
```

These commands run inside an app project: the nearest folder, from the current one upwards, whose `package.json` depends on `twenty-sdk`. Pass `--path` to choose another app. In a folder that contains several apps, `--path` is required, and the error lists them.

The CLI owns manifest generation, bundling and typechecking. It uses the app's
installed `twenty-sdk` authoring exports (`define` and `front-component`, SDK
`>=1.23.0`). An app without an installed SDK fails with `SDK_NOT_INSTALLED`;
missing or unsupported authoring
exports fail with `SDK_SOURCE_UNSUPPORTED`; an incompatible SDK Node requirement
fails with `NODE_VERSION_UNSUPPORTED`. The CLI never installs dependencies or
substitutes another SDK. Yarn Plug'n'Play is not supported; use
`nodeLinker: node-modules`.

Typechecking uses `typescript` installed in the app or its workspace, never the
global CLI's parser dependency. Missing TypeScript fails with
`TYPESCRIPT_NOT_INSTALLED`. Configuration errors and unbuilt project references
fail with `TYPECHECK_FAILED`. For example, a project with an unbuilt reference
to `tsconfig.spec.json` can report `TS6305`: remove an unintended reference, or
build the referenced project before checking the app. Changing compiler versions
can also change diagnostics.

Builds run in a separate worker process. That process does not receive the CLI's
connections or credentials: `TWENTY_API_URL`, `TWENTY_API_KEY`, `TWENTY_REMOTE`
and every `TWENTY_*` token, key, secret or password variable are removed from its
environment. App and SDK output becomes `PROJECT_OUTPUT` diagnostics; an app
that exits the process fails with `WORKER_FAILED`. This separates output and
process state; it is not a sandbox for untrusted code.

`app build` produces a temporary snapshot under `.twenty/cli/snapshots`, reports
its files, upload roles, sizes, SHA-256 checksums, content hash and manifest, then
deletes the snapshot. Nothing is uploaded or kept. `app typecheck` checks the
project without writing files. Build and type errors exit 1 with diagnostics in
`error.details.diagnostics`. Worker failures report the underlying code in
`error.details.toolingErrorCode`. Worker process failures use
`error.details.workerErrorCode`. Ctrl+C cancels the worker and exits 130; a
worker that does not stop within a few seconds is killed. The JSON `sdk` object
identifies the app's installed authoring SDK version.

The CLI version determines build rules, including derived permission identifiers.
Different tooling versions can produce different manifests. Run `twenty app plan`
and inspect the changes before applying an app with a different tooling version.

## Preview app changes

```bash
twenty app plan --remote dev
twenty app plan --path ./apps/billing --no-delete --json
```

`app plan` builds once with the CLI pipeline, releases the temporary snapshot, then requests the server's metadata preview with `dryRun: true`. It uses the usual connection selection and requires the server's `APPLICATIONS` permission. The server enforces authorization, ownership and manifest/version compatibility. No registration, installation, upload or metadata synchronization is performed, and planning never advances a pull base. The local build can generate app artifacts, just as `app build` does.

JSON marks plans with `plan: true`. A plan is not a saved approval: remote changes can alter what a later apply does. A missing owned application registration returns `PLAN_UNAVAILABLE` (exit 1). Register the app with `twenty app apply --create`, then plan again.

Entities missing from source are included as deletions by default. `--no-delete` passes `inferDeletionFromMissingEntities: false` to the preview. Human output lists every action, identifies object/field deletions that would remove stored data, and shows the opt-out hint. JSON includes action details and counts. Application-variable values, including previous values in updates, are redacted from all plan actions regardless of their `isSecret` setting. A plan exceeding 10,000 actions or the transport's 16 MiB response limit fails instead of displaying an incomplete plan.

## Apply an app

```bash
twenty app apply --remote dev
twenty app apply --create --json
twenty app apply --no-delete
```

`app apply` builds the app once with the CLI pipeline and keeps that build's snapshot until it finishes, so the files it uploads are the ones it built. It then asks the workspace for a fresh plan, shows it, and applies it: it installs the development app if needed, uploads the snapshot files, synchronizes the manifest, and regenerates the app's typed API client. It needs the server's `APPLICATIONS` and `UPLOAD_FILE` permissions.

- **New apps.** An app without a registration needs `--create`, or a yes at the prompt in an interactive terminal. The CLI then registers the app (the server also requires `API_KEYS_AND_WEBHOOKS` for this), installs it, and plans its changes before uploading anything. Without approval it stops with `CREATE_REQUIRED` (exit 2). The registration's client secret is never requested.
- **Deletions.** Entities missing from source are deleted by default, as in `app plan`; `--no-delete` keeps them and is sent to both the plan and the sync. Object and field deletions permanently delete stored data, so they need `--yes` or a yes at the prompt. Otherwise the command stops with `CONFIRMATION_REQUIRED` (exit 2) before changing anything. `--yes` never changes which entities are deleted.
- **Uploads.** File bytes go straight to the upload URLs the server returns, without the CLI's credentials. Each file is checked against the build's size and SHA-256 before anything is uploaded.
- **Pull baseline.** After an acknowledged sync, the CLI fetches the workspace ID and fresh application export, then atomically records `.twenty/cli/pull-base.json`. This baseline lets `app pull` distinguish workspace changes from local edits. It is bound to the normalized API URL, workspace UUID and app UUID. JSON reports `pullBase: "recorded"`, `"failed"` or `"unsupported"`; only a recorded base adds `pullBase` to `completedPhases`. Invalid exports or file-write errors preserve the prior base, warn with `PULL_BASE_NOT_RECORDED`, and allow client generation to continue. A server without the export API reports `"unsupported"` without a warning on every apply. The export is recorded as the server sent it; collections it lacks are read as empty by pull. Cancellation before the base is committed exits 130 with `outcome: "applied"` and `phase: "pullBase"`.
- **Typed client.** After the sync, the CLI fetches the app's GraphQL schema from the workspace and calls the app's own `twenty-client-sdk/generate` to regenerate the client in the app's own `node_modules/twenty-client-sdk` (`clientGeneration: "generated"`). It is skipped with a `CLIENT_NOT_GENERATED` warning when the app has no `node_modules/twenty-client-sdk` of its own, as in a hoisted workspace. A symlinked client package is followed and its target rewritten, so don't apply two apps that share one client package at the same time.
- **Failures.** A failed apply reports `details.phase`, `details.completedPhases` and `details.outcome`: `not-started` when the failing step changed nothing, `partial` when some files were uploaded, `unknown` when a request was sent but its effect is not known, such as a failed or interrupted sync, and `applied` when the sync succeeded but baseline recording was cancelled or client generation failed. Earlier steps, like a new registration, stay done. There is no rollback and no automatic retry: run `twenty app plan` to see where the workspace stands, then apply again. After `applied`, the workspace has the new version but the client files may be incomplete: fix the problem, then run `twenty app apply` again, which repeats the plan, upload and sync before regenerating the client. Ctrl+C exits with 130 and reports the step it interrupted.

Remote changes made between the plan and the sync can change what the sync does. Remote changes between the acknowledged sync and the export can also enter the saved baseline without appearing in local source; this is not an atomic server snapshot of the sync. Planning, a failed sync, or a sync with an unknown outcome never advances the baseline.

## Develop an app

```bash
twenty app dev --remote dev
twenty app dev --create --no-delete
twenty app dev --path ./apps/billing --format ndjson --no-delete
```

`app dev` builds and syncs once, then watches for edits. Each attempt uses the
same CLI build and strict project TypeScript checks as `app apply`. A failed
build prints diagnostics and keeps watching; it never uploads an incomplete
revision. It needs the same `APPLICATIONS` and `UPLOAD_FILE` permissions as apply.

The CLI watches the app folder and the external local files read by definition
loading, bundling and typechecking, including linked packages and extended
TypeScript configs. Relative imports of missing external files watch the nearest
existing parent, so creating the file can recover a failed build. The last
successful input graph stays watched after a failure. `.git`, `.twenty`,
`node_modules`, root `dist`, editor temporary files and `.DS_Store` are ignored.
Arbitrary filesystem reads inside app code are not discovered. Restart dev after
installing dependencies or changing the package manager's links.

Only one remote apply runs at a time. The compiler can prepare a newer complete
snapshot while that apply finishes; intermediate edits coalesce into the latest
revision. Uploads read independent, checksum-verified files, so a later build
cannot overwrite them. An unchanged content hash skips sync only after that
snapshot was acknowledged by the workspace. This is eventual convergence after
edits settle, not an atomic checkout of files being edited concurrently.

Registration uses `--create` or a terminal confirmation. Deletion inference is
on by default, with `--no-delete` to keep missing entities. Object and field
deletions require a terminal confirmation or `--yes`. Every revision requests a
fresh plan. An edit cancels a pending confirmation; approval for the
old revision cannot authorize the new one. A remote failure is reported with the
same phase/outcome details as apply and is retried only after a new source edit,
with a new plan. Inspect `twenty app plan` when a request's outcome is unknown.

After an acknowledged sync, dev records the pull base and regenerates the app's
own typed client when its schema, generator package or generated files changed.
Compilation pauses during generation, then explicitly rebuilds. Unchanged client
inputs and unchanged build output prevent a generation/sync loop. A schema fetch
failure keeps the old client and prints a warning. If generation starts writing
and fails, dev stops because the client files may be incomplete; fix the problem
and run `twenty app apply` before restarting dev.

Use human output or `--format ndjson`; `--json` is rejected before target lookup.
NDJSON uses ordered `progress` events with `data.kind`: `watch-ready`,
`build-start`, `build-success`, `build-failure`, `build-skipped`, `sync-start`,
`sync-progress`, `sync-superseded`, `sync-failure` and `sync-success`. Build events
carry the revision, successful builds also carry the build ID and content hash.
Output honors backpressure; buffered progress is bounded. Ctrl+C stops watching,
cancels active requests, releases snapshots after readers settle, and exits 130
with the interrupted remote phase when available. It does not roll back writes.

An abnormal worker exit or a filesystem-watcher failure ends the session; fix
the cause and restart `twenty app dev`. A killed process can leave temporary
folders in `.twenty/cli/snapshots`. After stopping all dev/apply sessions for that
app, abandoned snapshot folders can be removed.

## Pull an app

```bash
twenty app pull --remote dev
twenty app pull --path ./apps/billing --json
twenty app pull --universal-identifier <uuid> --verbose
```

`app pull` reads the app's definition and exports its workspace metadata into the existing project. It uses the selected connection and the server's `APPLICATIONS` permission; the server decides which apps this workspace can export. It does not register an app or change the workspace. When a project has no application definition, provide `--universal-identifier`. A project declaring a different app is refused before writing.

The project must have `twenty-sdk` installed, version `>=1.23.0`, with its public `twenty-sdk/define` and `twenty-sdk/front-component` exports. Pull also checks that the SDK provides the authoring APIs required by the generated files. Missing APIs fail with `SDK_SOURCE_UNSUPPORTED`; install a compatible version (2.40.0 or later). Pull does not require a project TypeScript compiler. Run `twenty app typecheck` afterwards to check the generated definitions against your installed SDK.

Pull compares workspace metadata and local definitions using a baseline saved
by apply or a previous pull in `.twenty/cli/pull-base.json`. The baseline belongs
to one API URL, workspace UUID and application UUID.

Pull overwrites local edits to entities that changed on the workspace, without a confirmation prompt. With a matching baseline, unchanged workspace entities keep their local source, and confirmed remote deletions remove their files. Without a matching baseline, local-only definitions stay in place and pull does not infer deletions. Coverage gaps, unreadable definitions and local-only nested entities are preserved and reported; gaps do not require `--force` or an opt-in partial mode. JSON includes `coverage`, `skipped`, `unreadableRelativePaths`, `localOnlyRelativePaths` and `overwrittenLocalChanges`. Without a baseline, overwritten local edits cannot be distinguished from generated source.

Before replacing local files, pull stages the new content and backs up the
originals. It updates the baseline only after writing the files. Ordinary write
failures restore the previous files and baseline.

Failures in reconciliation report `error.details.outcome`: `unchanged` after an acknowledged refusal, cancellation before writing or successful rollback; `unknown` if a worker stops without acknowledging completion or rollback fails; `pulled` if writes and baseline completed but temporary-file cleanup failed. An interrupted worker can leave files partially written; inspect the changes and retained `.twenty/cli/pull-backup-*` files before retrying. A failed rollback also reports `backupDirectory`. Ctrl+C exits 130 unless the worker acknowledges a completed commit, in which case pull returns its result.

The current export contains metadata and translations, not application source assets or dependency files. Logic-function/front-component code and unsupported metadata are not regenerated. An export with nonempty `files` is refused before writing. Package files, dependency pins and the installed generated client are left alone; pull never installs dependencies. Each export response is limited to 16 MiB. See the [pull implementation](../src/app/pull/README.md) for reconciliation and compatibility details.

## Uninstall an app

```bash
twenty app uninstall --remote dev
twenty app uninstall --yes --json
twenty app uninstall --universal-identifier <id> --yes
```

`app uninstall` builds the app to find its universal identifier, checks that the app is installed on the target and that the workspace allows uninstalling it, then uninstalls it. `--universal-identifier` skips the build, so an app whose source no longer builds can still be uninstalled. It needs the server's `APPLICATIONS` permission.

Uninstalling runs the app's uninstall hook and deletes everything the app owns, including its objects, fields and their data. It always needs `--yes`, or a yes at the prompt in an interactive terminal; otherwise it stops with `CONFIRMATION_REQUIRED` (exit 2) before changing anything. An app that is not installed returns `APP_NOT_INSTALLED` (exit 4), and one the workspace does not allow to uninstall returns `APP_NOT_UNINSTALLABLE` (exit 6).

The app's registration is kept, so `twenty app apply` can install it again without `--create`. Failures report `details.phase`, `details.completedPhases` and `details.outcome`, as for apply: an uninstall request that fails after the server received it, or is interrupted with Ctrl+C, has an `unknown` outcome. Running the command again reports `APP_NOT_INSTALLED` once the app is gone. `--universal-identifier` accepts any UUID casing and sends the canonical lowercase form.

## Execute an app function

```bash
twenty app exec --name add-numbers --remote dev --payload '{"a":2,"b":3}'
twenty app exec --universal-identifier <uuid> --payload @payload.json --json
printf '{"a":4,"b":7}' | twenty app exec --name add-numbers --remote dev --payload - --json
```

Run from the app folder or pass `--path`. The CLI reads app definitions to find
its functions, then executes the selected function's deployed code. Sync local
changes with `app apply` or `app dev` first. Execution does not build bundles,
typecheck, sync, register or install the app.

Choose exactly one of `--name` (exact deployed name), `--universal-identifier`,
`--post-install`, `--pre-install` or `--uninstall-hook`. Hook selectors run the
hook's code and its side effects without installing or uninstalling the app.
Payloads must be JSON objects, supplied inline, through `@file`, or through `-`
for stdin; the default is `{}`. The selected function must belong to both the
local app manifest and the installed app on the target workspace.

The current server requires a signed-in user and the `APPLICATIONS` and
`WORKFLOWS` settings permissions. Sign in with `twenty auth login --url <url>
--name dev`, then pass `--remote dev`. API keys, including environment API-key
targets, cannot execute logic functions. The server additionally restricts
which functions the user may run on demand.

Human output shows status, duration, returned data, error and logs. `--json`
returns those fields in the standard envelope; NDJSON is not supported. A
function returning a non-SUCCESS status exits 1 with `EXECUTION_FAILED`, keeping
its data, logs and error in `error.details` with `outcome: "completed"`.

There are no automatic retries. The request deadline uses the deployed
function's timeout plus 60 seconds. A lost response or Ctrl+C can leave the
function running on the server; the error reports `outcome: "unknown"` and asks
you to check its effects before retrying. An acknowledged execution rejection
reports `"not-started"`. Ctrl+C exits 130, without rolling back side effects.
See the [execution implementation](../src/app/exec/README.md) for compatibility details.

## Watch app logs

```bash
twenty app logs --remote dev
twenty app logs --name add-numbers --remote dev
twenty app logs --universal-identifier <uuid> --format ndjson
```

Run from the app folder or pass `--path`. This watches newly published execution
output from every logic function in that app. Output arrives when an execution
finishes, not line by line while it runs. It does not fetch historical logs,
watch other apps, or build, sync, register or install anything.

Names are not unique: `--name` matches every function with that exact name in the
app. Use `--universal-identifier` to isolate one function. The two filters are
mutually exclusive. Human output labels each execution with its function name
and identifier; NDJSON records contain `applicationUniversalIdentifier`,
`functionName`, `functionUniversalIdentifier` and `logs`.

Some server schemas expose only log text. If the identity fields are unsupported,
the CLI warns and subscribes once requesting only `logs`. An explicit filter
supplies that name or identifier; unknown identities are `null` in NDJSON and
omitted from human labels. With neither filter, those schemas cannot attribute
mixed output to individual functions.

The stream supports human output and `--format ndjson`; finite `--json` is
rejected. Ctrl+C closes it and exits 130. A server completion exits 0. A dropped
or stalled connection exits with an error and the emitted record count, with no
automatic reconnect because missed logs cannot be replayed. Slow output applies
backpressure; each SSE frame is limited to 16 MiB, with no session-size cap.
Connection setup and gaps between received body chunks each have a 60-second
deadline; server heartbeat comments keep quiet subscriptions alive.

This uses the existing app-log subscription and its `WORKFLOWS` permission and
application access checks. API keys and browser-login remotes are supported.
It does not require the paid audit-log entitlement, ClickHouse history or the
workspace-wide Settings logs API. See the [log subscription implementation](../src/app/function-logs/README.md).

## Expired browser sessions

For commands that use a workspace, interactive OAuth sessions are checked before
the command starts. If a session is rejected or cannot be refreshed, the CLI
offers to sign in again once, validates the new session, and saves its credentials
without changing the remote's URL, default selection or other settings.

API keys, JSON/NDJSON output, `--no-input`, redirected stdin and CI never trigger
this prompt. Permission errors do not trigger sign-in either. If authentication
fails after a command starts, the CLI stops with the login hint; it does not
replay requests or restart an app apply. A remote changed during sign-in is left
as-is, and the command stops with `CONFLICT`.

## Output

`twenty version` (or `--version`) reports the running executable's version.
`twenty version --json` also includes Node, platform and architecture.
`twenty commands --json` lists command arguments, flags, output modes and
project/target requirements for scripts that discover the command surface.

Commands print readable text by default. With `--json`, a command prints exactly one JSON document on stdout, including when it fails:

```json
{
  "schemaVersion": 1,
  "ok": true,
  "command": "version",
  "data": {
    "version": "0.3.0",
    "node": "24.9.0",
    "platform": "darwin",
    "arch": "arm64"
  },
  "warnings": []
}
```

A failure has `"ok": false` and an `error` object with a stable `code`, a `message`, and sometimes a `hint` and `details`.

Exit codes:

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 0    | Success                             |
| 1    | Failure                             |
| 2    | Usage error or missing confirmation |
| 3    | Authentication or permission denied |
| 4    | Not found                           |
| 5    | Partial failure                     |
| 6    | Conflict                            |
| 130  | Cancelled                           |
