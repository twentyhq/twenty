# Upgrade Commands

The upgrade process relies on two types of commands:

- **Instance commands** — schema and data migrations that run once at the instance level (replacing raw TypeORM migrations).
- **Workspace commands** — commands that iterate over all active or suspended workspaces to apply per-workspace changes.

Both are registered via decorators and automatically discovered by the upgrade pipeline.

## Instance Commands

### Generating an instance command

```bash
npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>
```

This generates a timestamped file and auto-registers it in `instance-commands.constant.ts` — do not edit that file manually.

### Fast instance commands

Fast commands run immediately during the upgrade. They are used for schema changes that could introduce breaking inconsistencies between the database and the server if delayed.

A fast command implements `FastInstanceCommand` and provides `up` / `down` methods:

```ts
@RegisteredInstanceCommand('1.22.0', 1775758621017)
export class AddWorkspaceIdToTotoFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."toto" ADD "workspaceId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."toto" DROP COLUMN "workspaceId"`,
    );
  }
}
```

### Slow instance commands

Slow commands are used when a potentially long-running data migration must happen before the schema change. They only run when the `--include-slow` flag is passed.

A slow command implements `SlowInstanceCommand`, which extends `FastInstanceCommand` with an additional `runDataMigration` method that executes before `up`:

```ts
@RegisteredInstanceCommand('1.22.0', 1775758621018, { type: 'slow' })
export class BackfillWorkspaceIdSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // Backfill logic (can be slow — e.g. iterating over workspaces, cache recomputation)
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."toto" ALTER COLUMN "workspaceId" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."toto" ALTER COLUMN "workspaceId" DROP NOT NULL`,
    );
  }
}
```

A common pattern is to pair a **fast** command (add a nullable column) with a **slow** command (backfill existing rows, then set `NOT NULL`).

## Workspace Commands

Workspace commands run per-workspace logic across all active or suspended workspaces. They are registered with the `@RegisteredWorkspaceCommand` decorator alongside nest-commander's `@Command` decorator:

```ts
@RegisteredWorkspaceCommand('1.22.0', 1780000002000)
@Command({
  name: 'upgrade:1-22:backfill-standard-skills',
  description:
    'Backfill standard skills for existing workspaces',
})
export class BackfillStandardSkillsCommand
  extends ActiveOrSuspendedWorkspaceCommandRunner
{
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    // inject any services you need
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    // Per-workspace logic goes here
    // options.dryRun, options.verbose are available for free
  }
}
```

The base class `ActiveOrSuspendedWorkspaceCommandRunner` handles workspace iteration and provides `--dry-run`, `--verbose`, and workspace filter options automatically.

### Applying a migration matrix: side-effect vs legacy path

Commands that build a metadata migration go through `WorkspaceMigrationValidateBuildAndRunService`. Two entry points exist:

- `validateBuildAndRunWorkspaceMigration` (default): runs the operation matrix through the metadata side-effect engine (`expandWithSideEffects`) before building. The engine injects and cascades engine-owned companions (system fields and relations, the `searchVector` field and its GIN index, `searchFieldMetadata` rows, unique backing indexes). This is what the live API and application manifests rely on, so new commands should use it.
- `validateBuildAndRunLegacyWorkspaceMigration`: skips side-effect expansion and applies the matrix literally, exactly as it was authored.

The side-effect engine landed in v2.19. Commands authored before then declared their companions explicitly and were never designed to flow through the engine. Running them through it retroactively changes their behavior: it can hard-fail on reserved-identifier collisions (`RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER`) and silently create rows the command never intended (for example, the deterministic `searchFieldMetadata` rows that the standalone `upgrade:2-16:backfill-search-field-metadata` backfill then re-inserts, hitting `IDX_SEARCH_FIELD_METADATA_OBJECT_FIELD_UNIQUE`).

Rule of thumb:

- Target version **< 2.19** → use the **legacy** method.
- Target version **>= 2.19** → use the default side-effect method.

All pre-2.19 commands follow this rule, including `upgrade:2-10:sync-call-recording-standard-objects`: it builds its create-set from the static twenty-standard definition (which declares all of `callRecording`'s fields, including the `searchVector` system field) and runs it through the legacy path so nothing is injected on top. Its matrix contains no `searchFieldMetadata` operations; the deterministic rows are created later in the same upgrade pipeline by `upgrade:2-16:backfill-search-field-metadata`, which derives them from the standard definition.

Known gap: the static definition does not yet declare `callRecording`'s `searchVector` GIN index (every other searchable standard object declares its GIN index statically), so workspaces upgrading through 2-10 on the legacy path create the `searchVector` column unindexed. The static declaration plus a backfill for already-upgraded workspaces land in a follow-up (twentyhq/core-team-issues#2672), which must ship in the same release as this legacy path.

## Execution Order

Within a given version of Twenty, the upgrade pipeline runs commands in this order, sorted by timestamp within each group:

1. **Instance fast** commands
2. **Instance slow** commands
3. **Workspace commands**

Workspace commands are executed sequentially across all active/suspended workspaces.

## Interrupting a run (Ctrl+C, SIGTERM)

Ctrl+C during an `upgrade` stops it gracefully: the workspace being processed finishes its commands, then the run stops instead of starting the next one. Ctrl+C again forces an immediate exit, leaving the command in progress unfinished.

Rerun the command to resume. Nothing is rolled back, and the run picks up from the last command recorded in `upgradeMigration`.

Expect the first Ctrl+C to look like it did nothing while a long step is running: it takes effect once the step ends.

### Running detached

A foreground `upgrade` is a child of the shell it was started from, so anything that drops that shell kills the run: a `kubectl exec` session losing its SSM tunnel, a closed laptop, an expired VPN. `scripts/upgrade-background.sh` puts the run in its own session with no controlling terminal and streams its output from a log file instead, so the run survives the disconnect and can be re-attached from a new shell.

Use it for any long upgrade started over `kubectl exec` or SSH. A foreground run is still the right thing locally, or in CI where the parent process is stable.

```bash
yarn upgrade:background [args]   # start detached, then stream the log
yarn upgrade:background:logs     # re-attach from another shell
yarn upgrade:background:stop     # graceful stop; --now for immediate, --force for SIGKILL
```

`upgrade:background` refuses to start when it can see a run already in flight. Ctrl+C on the log stream detaches the stream only, the run keeps going, and `logs` supports any number of concurrent readers.

Everything after `upgrade:background` is forwarded verbatim to `upgrade`, so it takes that command's options and no others:

| Option | Effect |
| --- | --- |
| `-d`, `--dry-run` | simulate without making changes |
| `-v`, `--verbose` | verbose output |
| `-w`, `--workspace-id <id>` | restrict to a workspace, repeatable; all provisioned workspaces if omitted |
| `--start-from-workspace-id <id>` | resume from a workspace, ascending id order |
| `--workspace-count-limit <n>` | process at most n workspaces, ascending id order |

`-w` and `--start-from-workspace-id` are mutually exclusive and `upgrade` rejects the combination. Note that `--include-slow` is **not** one of these: it belongs to `run-instance-commands`, which the upgrade pipeline invokes itself.

`logs` is the only one you need to check on a run, because it reports what it found before streaming. If a run is alive it announces the pid and follows the log. If none is alive it prints how the last one ended and dumps the tail instead of following, so it always terminates rather than waiting on a log that will never grow again. That distinction cannot be made from the log alone: a workspace segment can run for many minutes without printing anything, so a silent log looks identical whether the run is grinding through a slow segment or was killed twenty minutes ago. Only the recorded pid answers it.

`stop` has three tiers, deliberately three explicit invocations with no timed escalation between them: a single workspace segment can take many minutes, so a timer that escalated to `SIGKILL` on its own would defeat the graceful path entirely.

| Invocation | Signal | Effect |
| --- | --- | --- |
| `stop` | one `SIGTERM` | stops at the next boundary, exit `143` |
| `stop --now` | two spaced `SIGTERM`s | immediate exit, step in progress left unfinished |
| `stop --force` | `SIGKILL` | no graceful boundary, a multi-transaction command may leave partial work |

Every tier prints the tail of the log after signalling, so you can see which workspace and step the run was on without a second command. The plain `stop` waits a moment first, long enough for the runner's "finishing the step in progress" acknowledgement to reach the log, which is the confirmation that the signal was received and is being honoured rather than ignored.

Only the node process is signalled, never the process group. A group signal would also hit the wrapper shell, killing the process that records the exit code and tearing down node's parent while it is trying to finish its segment.

#### Reading the outcome

The wrapper outlives node and appends an `EXIT=<code>` line to the log, which is what `logs` and `status` translate:

| Log | Meaning |
| --- | --- |
| `EXIT=0` | completed |
| `EXIT=130` | graceful stop on `SIGINT` |
| `EXIT=143` | graceful stop on `SIGTERM`, what `stop` and `stop --now` produce |
| `EXIT=137` | `SIGKILL`ed, what `stop --force` produces, and what an OOM kill looks like |
| any other `EXIT=` | the upgrade failed |
| no `EXIT=` line | the wrapper died too, so the run was killed without any graceful stop (pod replaced, container restarted, host lost) |

A graceful stop is always safe to rerun: nothing is rolled back, and the rerun resumes from the last command recorded in `upgradeMigration`, with each workspace either fully done with its segment or untouched. Rerunning after a forced kill or a lost pod is safe too, but only because upgrade commands are idempotent, since a command interrupted mid-flight may have left partial work.

#### Limits of this mode

Ctrl+C cannot reach a detached run at all: it has its own session and no controlling terminal, so no terminal can send it `SIGINT`. `upgrade:background:stop` is the only graceful entry point here, and the `130` exit code only ever shows up on foreground runs.

The log and PID files live in `/tmp` inside the container (override with `TWENTY_UPGRADE_LOG_FILE` and `TWENTY_UPGRADE_PID_FILE`). Both are lost if the pod is replaced, along with the run itself.

That also bounds what the refusal above is worth. It keeps one pod's bookkeeping straight, one PID file and one log per run, and nothing more: a second pod, or a laptop pointed at the same database, sees none of it. Nothing in `upgrade` itself prevents two sequences running at once either. `upgradeMigration` records only `completed` and `failed`, so it has no in-progress state to lock against, and there is no advisory lock in the sequence runner. Two concurrent runs would each do the work before one of them lost the race to record it and failed on a unique-index violation. Treat "only one upgrade at a time" as an operational rule, not something the tooling enforces.

Detaching needs `setsid`, which is what puts the run in its own session. The runtime image has it (busybox provides the applet) and so does any Linux host, but macOS does not ship it, so `upgrade:background` refuses to start there and points you at the foreground command. That is no real loss, since a local run has no connection to drop in the first place.

Kubernetes cannot stop a detached run gracefully either, and `terminationGracePeriodSeconds` is not the lever it looks like. PID 1 in the command-runner pod is `tail -f /dev/null`, so on pod deletion it exits immediately and the detached node process is torn down without ever receiving `SIGTERM`, however long the grace period is. Graceful shutdown on eviction only applies when node is the container's main process, which is the foreground case, not this one.

## Shipping a command for a future version (deferred drops)

You can write a command for a version listed in `TWENTY_NEXT_VERSIONS` — typically the second half of a zero-downtime migration, e.g. dropping a column one release after its replacement ships. Pass the target version to the generator:

```bash
npx nx run twenty-server:database:migrate:generate --name <name> --type fast --version 2.20.0
```

It registers and boots (versions are validated against `TWENTY_ALL_VERSIONS`) but stays **dormant** — the sequence only runs `TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS` (previous + current). It activates automatically when `nx version:bump` promotes the version to current.

**Caveat:** `@WasRemovedInUpgrade` / `@WasIntroducedInUpgrade` are validated against the active sequence, so a decorator pointing at a still-dormant next-version command fails boot with `unknown-step-name`. For a deferred drop, keep the entity's `WasRemovedInUpgrade<T>` type wrapper now and add the decorator only once the version is current.

See the CI workflows for how upgrade commands are exercised in continuous integration.
