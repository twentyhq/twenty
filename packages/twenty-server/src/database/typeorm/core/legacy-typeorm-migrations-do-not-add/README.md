# Legacy TypeORM migrations — do not add new files here

This directory contains historical TypeORM migrations (`common/` and `billing/`).
They are kept so that older deployments can still replay them against the
`_typeorm_migrations` table.

**The TypeORM migration system is frozen.** Do not add new files here.

The active upgrade system is **instance commands** (fast / slow) and
**workspace commands**, registered with `@RegisteredInstanceCommand` and
`@RegisteredWorkspaceCommand`. Generate one with:

```bash
npx nx run twenty-server:database:migrate:generate --name <name> --type <fast|slow>
```

See `packages/twenty-server/docs/UPGRADE_COMMANDS.md` for the full guide and
`packages/twenty-server/src/database/commands/upgrade-version-command/` for
existing examples.

Note: `../migrations/utils/` is **not** legacy — those SQL helpers are still
imported by current instance/workspace commands and live outside this folder
on purpose.
