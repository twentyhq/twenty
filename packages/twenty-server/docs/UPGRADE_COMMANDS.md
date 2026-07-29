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

`upgrade` and any command extending `WorkspaceCommandRunner` install cooperative shutdown handlers for `SIGINT` and `SIGTERM`. Handlers are opt-in per command (`CommandShutdownService.listenToShutdownSignals()`), because registering one removes the default kill-on-signal behavior: a command that installs a handler without honoring the flag would ignore the first Ctrl+C entirely. Every other CLI command, `run-instance-commands` included, keeps the default behavior and dies on the first signal.

- **First signal** — the runner finishes what it started, then stops at the next boundary instead of starting new work. Only the two iteration runners check for a shutdown: `UpgradeSequenceRunnerService` before each sequence step, and `WorkspaceIteratorService` before each workspace. Individual commands know nothing about shutdown, so a workspace that has started runs its whole pending segment before the run stops. The process exits with `130` (SIGINT) or `143` (SIGTERM) so orchestrators can tell an interruption apart from a failure.
- **Second signal** — the process exits immediately, leaving the command in progress unfinished.
- **`SIGKILL`** — cannot be trapped, same outcome as a second signal.

Nothing is rolled back on stop: the run resumes from the last command recorded in `upgradeMigration`. A graceful stop leaves each workspace either fully done with the segment or untouched, so resuming is a plain rerun. A forced kill can interrupt a command mid-flight; its own transaction rolls back, but a command that writes across several transactions may leave partial work, which is why upgrade commands must be idempotent.

Expect the first signal to look like it did nothing while a step is running. `upgrade` runs instance steps through the same loop, and a slow instance command can spend a long time in `runDataMigration` before the next boundary is reached. The run stops when the step ends; send the signal again to give up on it instead.

Under Kubernetes, `terminationGracePeriodSeconds` must be long enough for the workspace in progress to finish its segment, otherwise the pod is `SIGKILL`ed before the graceful stop completes.

## Shipping a command for a future version (deferred drops)

You can write a command for a version listed in `TWENTY_NEXT_VERSIONS` — typically the second half of a zero-downtime migration, e.g. dropping a column one release after its replacement ships. Pass the target version to the generator:

```bash
npx nx run twenty-server:database:migrate:generate --name <name> --type fast --version 2.20.0
```

It registers and boots (versions are validated against `TWENTY_ALL_VERSIONS`) but stays **dormant** — the sequence only runs `TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS` (previous + current). It activates automatically when `nx version:bump` promotes the version to current.

**Caveat:** `@WasRemovedInUpgrade` / `@WasIntroducedInUpgrade` are validated against the active sequence, so a decorator pointing at a still-dormant next-version command fails boot with `unknown-step-name`. For a deferred drop, keep the entity's `WasRemovedInUpgrade<T>` type wrapper now and add the decorator only once the version is current.

See the CI workflows for how upgrade commands are exercised in continuous integration.
