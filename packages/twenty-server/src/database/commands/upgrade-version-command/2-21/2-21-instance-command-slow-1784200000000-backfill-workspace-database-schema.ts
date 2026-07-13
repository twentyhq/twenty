import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

// Restores the workspace.databaseSchema invariant on instances where the
// column was never populated, then enforces it with a check constraint.
// Creation only started writing databaseSchema in 2.x (dual-write since
// 2026-03-28, direct write since 2026-04-10); older workspaces relied on the
// 1-21 backfill-datasource-to-workspace command, which never effectively ran on
// some instances. The schema name is derived deterministically from the
// workspace id, so we only set the column for workspaces whose schema actually
// exists in Postgres to avoid pointing at a non-provisioned schema.
//
// The backfill (runDataMigration) runs before up(), so the constraint is added
// once the data has been repaired. It must live here in the slow command rather
// than in a standalone fast command: a fast command runs on every upgrade
// (including non --include-slow runs) and would add the constraint before the
// backfill ever repairs the legacy null rows. See core-team-issues#2666.
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

  // Runs after runDataMigration, so every repairable workspace already has its
  // databaseSchema set. The constraint is validated here (no NOT VALID): any
  // remaining active workspace without a schema is genuine corruption that must
  // surface loudly rather than be silently tolerated.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "workspace_requires_database_schema" CHECK ("activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "databaseSchema" IS NOT NULL)`,
    );
  }

  // The constraint is dropped on rollback. The backfill itself cannot be safely
  // reversed since we cannot know which rows were null before it ran.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
  }
}
