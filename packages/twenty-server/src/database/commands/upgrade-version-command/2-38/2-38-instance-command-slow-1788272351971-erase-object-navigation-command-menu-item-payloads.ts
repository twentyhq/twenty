import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const ENGINE_KEY_COHERENCE_CHECK_NAME = 'CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE';

const RELAXED_ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND ("payload" IS NOT NULL OR "navigationTargetObjectMetadataId" IS NOT NULL) AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL)`;

const EXCLUSIVE_ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND (("payload" IS NOT NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("payload" IS NULL AND "navigationTargetObjectMetadataId" IS NOT NULL)) AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL)`;

@RegisteredInstanceCommand('2.38.0', 1788272351971, { type: 'slow' })
export class EraseObjectNavigationCommandMenuItemPayloadsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      UPDATE "core"."commandMenuItem"
      SET "payload" = NULL
      WHERE "engineComponentKey" = 'NAVIGATION'
        AND "navigationTargetObjectMetadataId" IS NOT NULL
        AND "payload" IS NOT NULL
    `);
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${EXCLUSIVE_ENGINE_KEY_COHERENCE_CHECK})`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    // Resynthesizes the legacy payloads from the foreign key so the fast
    // command's down can reinstate the payload-required check afterwards.
    await queryRunner.query(`
      UPDATE "core"."commandMenuItem"
      SET "payload" = jsonb_build_object('objectMetadataItemId', "navigationTargetObjectMetadataId")
      WHERE "engineComponentKey" = 'NAVIGATION'
        AND "navigationTargetObjectMetadataId" IS NOT NULL
        AND "payload" IS NULL
    `);
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${RELAXED_ENGINE_KEY_COHERENCE_CHECK})`,
    );
  }
}
