import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Restores the workspace.databaseSchema invariant on instances where the
// column was never populated. Creation only started writing databaseSchema in
// 2.x (dual-write since 2026-03-28, direct write since 2026-04-10); older
// workspaces relied on the 1-21 backfill-datasource-to-workspace command, which
// never effectively ran on some instances. The schema name is derived
// deterministically from the workspace id, so we only set the column for
// workspaces whose schema actually exists in Postgres to avoid pointing at a
// non-provisioned schema. See twentyhq/core-team-issues#2666.
@RegisteredInstanceCommand('2.21.0', 1784200000000, { type: 'slow' })
export class BackfillWorkspaceDatabaseSchemaSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const workspacesWithoutSchema: { id: string }[] = await dataSource.query(
      `SELECT id FROM "core"."workspace" WHERE "databaseSchema" IS NULL OR "databaseSchema" = ''`,
    );

    if (workspacesWithoutSchema.length === 0) {
      return;
    }

    const existingSchemas: { schema_name: string }[] = await dataSource.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'workspace\\_%'`,
    );
    const existingSchemaNames = new Set(
      existingSchemas.map((row) => row.schema_name),
    );

    const updates = workspacesWithoutSchema
      .map((workspace) => ({
        id: workspace.id,
        schemaName: getWorkspaceSchemaName(workspace.id),
      }))
      .filter((update) => existingSchemaNames.has(update.schemaName));

    if (updates.length === 0) {
      return;
    }

    await dataSource.query(
      `UPDATE "core"."workspace" AS w
       SET "databaseSchema" = data.schema_name
       FROM (
         SELECT UNNEST($1::uuid[]) AS id, UNNEST($2::text[]) AS schema_name
       ) AS data
       WHERE w.id = data.id`,
      [
        updates.map((update) => update.id),
        updates.map((update) => update.schemaName),
      ],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Intentional no-op: the backfill cannot be safely reversed since we cannot
  // know which rows were null before it ran.
  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
