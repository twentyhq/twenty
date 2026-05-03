import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Backfills the new toolTriggerSettings and workflowActionTriggerSettings
// columns from the legacy isTool + toolInputSchema columns, then drops the
// legacy columns.
//
// Behaviour preservation: today, isTool=true makes a logic function appear
// as both an AI tool AND a workflow node, so we populate both new triggers
// for any existing tool. Apps can later refine workflowActionTriggerSettings
// to use FieldMetadataType-aware schemas.
@RegisteredInstanceCommand('2.4.0', 1797000002000, { type: 'slow' })
export class MigrateToolTriggerSettingsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const defaultJsonSchema = `'{"type":"object","properties":{}}'::jsonb`;

    // Tool trigger: store the existing JSON Schema verbatim under inputSchema.
    // Workflow action trigger: wrap the JSON Schema in a single-element array
    // -- Twenty's InputSchema is the parameter list of a function, and logic
    // functions take a single params object.
    await dataSource.query(
      `UPDATE "core"."logicFunction"
          SET "toolTriggerSettings" = jsonb_build_object(
                'inputSchema',
                COALESCE("toolInputSchema", ${defaultJsonSchema})
              ),
              "workflowActionTriggerSettings" = jsonb_build_object(
                'inputSchema',
                jsonb_build_array(
                  COALESCE("toolInputSchema", ${defaultJsonSchema})
                )
              )
        WHERE "isTool" = true
          AND "toolTriggerSettings" IS NULL
          AND "workflowActionTriggerSettings" IS NULL`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "isTool"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" DROP COLUMN "toolInputSchema"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "toolInputSchema" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."logicFunction" ADD "isTool" boolean NOT NULL DEFAULT false`,
    );
    // Best-effort reverse backfill so existing tools keep functioning if
    // someone rolls back. Pulls the JSON schema out of toolTriggerSettings.
    await queryRunner.query(
      `UPDATE "core"."logicFunction"
          SET "isTool" = true,
              "toolInputSchema" = "toolTriggerSettings"->'inputSchema'
        WHERE "toolTriggerSettings" IS NOT NULL`,
    );
  }
}
