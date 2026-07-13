import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredInstanceCommand('2.21.0', 1783934147089, { type: 'slow' })
export class BackfillWorkspaceDatabaseSchemaSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    // Workspaces still in the creation phase are legitimately allowed to have an
    // empty databaseSchema (their Postgres schema is not provisioned yet), so we
    // exclude them here to mirror the workspace_requires_database_schema
    // constraint predicate and avoid touching rows that are meant to be null.
    const workspacesWithoutSchema: { id: string }[] = await dataSource.query(
      `SELECT id FROM "core"."workspace"
       WHERE ("databaseSchema" IS NULL OR "databaseSchema" = '')
         AND "activationStatus" NOT IN ('PENDING_CREATION', 'ONGOING_CREATION')`,
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

  // Added NOT VALID on purpose: runDataMigration repairs every workspace whose
  // Postgres schema actually exists, but some legacy active/suspended workspaces
  // (carried over from very old versions) can have a null databaseSchema with no
  // provisioned schema to point at. Those rows are unrepairable here, so we
  // enforce the invariant on all future inserts/updates without failing the
  // upgrade on pre-existing corruption. Newly created workspaces write
  // databaseSchema before leaving the creation phase, so the constraint never
  // fights the PENDING_CREATION -> ACTIVE transition.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "workspace_requires_database_schema" CHECK ("activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "databaseSchema" IS NOT NULL) NOT VALID`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
  }
}
