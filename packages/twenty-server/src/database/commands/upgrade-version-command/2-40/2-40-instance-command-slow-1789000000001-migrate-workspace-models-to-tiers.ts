import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const LEGACY_WORKSPACE_MODEL_COLUMNS = [
  'fastModel',
  'smartModel',
  'enabledAiModelIds',
  'useRecommendedModels',
  'routerModel',
];

const hasLegacyWorkspaceModelColumns = async (
  runQuery: (sql: string, parameters?: unknown[]) => Promise<unknown[]>,
): Promise<boolean> => {
  const rows = await runQuery(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'core' AND table_name = 'workspace' AND column_name = 'smartModel'`,
  );

  return rows.length > 0;
};

// A workspace that had picked concrete models keeps them as pins in manual
// mode; every other workspace moves to automatic selection with the new
// defaults. Agents created with the old smart default follow the workspace
// agent tier from now on. Guarded on the old columns so a re-run after the
// schema step is a no-op.
@RegisteredInstanceCommand('2.40.0', 1789000000001, { type: 'slow' })
export class MigrateWorkspaceModelsToTiersSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    if (
      !(await hasLegacyWorkspaceModelColumns((sql) => dataSource.query(sql)))
    ) {
      return;
    }

    // Composite ids always contain a slash; the auto-select ids never do.
    await dataSource.query(
      `UPDATE "core"."workspace"
       SET "isAutoModelSelectionEnabled" = false,
           "aiModelIdByTier" = jsonb_strip_nulls(jsonb_build_object(
             'smart', CASE WHEN "smartModel" LIKE '%/%' THEN "smartModel" END,
             'fast', CASE WHEN "fastModel" LIKE '%/%' THEN "fastModel" END
           ))
       WHERE "smartModel" LIKE '%/%' OR "fastModel" LIKE '%/%'`,
    );
    await dataSource.query(
      `UPDATE "core"."agent" SET "modelId" = 'workspace-default-model' WHERE "modelId" = 'default-smart-model'`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      !(await hasLegacyWorkspaceModelColumns((sql) => queryRunner.query(sql)))
    ) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ${LEGACY_WORKSPACE_MODEL_COLUMNS.map(
        (column) => `DROP COLUMN "${column}"`,
      ).join(', ')}`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "routerModel" character varying NOT NULL DEFAULT 'auto'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "useRecommendedModels" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "enabledAiModelIds" character varying array NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "smartModel" character varying NOT NULL DEFAULT 'default-smart-model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "fastModel" character varying NOT NULL DEFAULT 'default-fast-model'`,
    );
    await queryRunner.query(
      `UPDATE "core"."workspace"
       SET "smartModel" = COALESCE("aiModelIdByTier"->>'smart', "smartModel"),
           "fastModel" = COALESCE("aiModelIdByTier"->>'fast', "fastModel")
       WHERE "isAutoModelSelectionEnabled" = false`,
    );
    await queryRunner.query(
      `UPDATE "core"."agent" SET "modelId" = 'default-smart-model' WHERE "modelId" = 'workspace-default-model'`,
    );
  }
}
