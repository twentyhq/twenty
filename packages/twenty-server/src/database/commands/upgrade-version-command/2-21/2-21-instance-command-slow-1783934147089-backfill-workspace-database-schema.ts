import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredInstanceCommand('2.21.0', 1783934147089, { type: 'slow' })
export class BackfillWorkspaceDatabaseSchemaSlowInstanceCommand
  implements SlowInstanceCommand
{
  // Schema names are deterministic from the workspace id, so we backfill them
  // unconditionally — even if the schema doesn't exist yet in Postgres — which
  // lets up() add the check constraint fully validated.
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const workspacesWithoutSchema: { id: string }[] = await dataSource.query(
      `SELECT id FROM "core"."workspace"
       WHERE ("databaseSchema" IS NULL OR "databaseSchema" = '')
         AND "activationStatus" NOT IN ('PENDING_CREATION', 'ONGOING_CREATION')`,
    );

    if (workspacesWithoutSchema.length === 0) {
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
        workspacesWithoutSchema.map((workspace) => workspace.id),
        workspacesWithoutSchema.map((workspace) =>
          getWorkspaceSchemaName(workspace.id),
        ),
      ],
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "workspace_requires_database_schema" CHECK ("activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR ("databaseSchema" IS NOT NULL AND "databaseSchema" <> ''))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT IF EXISTS "workspace_requires_database_schema"`,
    );
  }
}
