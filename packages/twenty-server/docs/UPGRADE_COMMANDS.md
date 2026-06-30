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

## Execution Order

Within a given version of Twenty, the upgrade pipeline runs commands in this order, sorted by timestamp within each group:

1. **Instance fast** commands
2. **Instance slow** commands
3. **Workspace commands**

Workspace commands are executed sequentially across all active/suspended workspaces.
