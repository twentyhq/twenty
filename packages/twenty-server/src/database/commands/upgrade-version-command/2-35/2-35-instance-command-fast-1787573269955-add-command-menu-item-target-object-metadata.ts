import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const ENGINE_KEY_COHERENCE_CHECK_NAME = 'CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE';

const PREVIOUS_ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL)`;

// The NAVIGATION branch stays permissive: object keyed rows only carry the
// target once the 2-35 backfill has run everywhere, and path based rows never do
const ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL)`;

@RegisteredInstanceCommand('2.35.0', 1787573269955)
export class AddCommandMenuItemTargetObjectMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "navigationTargetObjectMetadataId" uuid',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${ENGINE_KEY_COHERENCE_CHECK})`,
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_COMMAND_MENU_ITEM_NAVIGATION_TARGET_OBJECT_METADATA_ID" ON "core"."commandMenuItem" ("navigationTargetObjectMetadataId")',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_29d15e273efc5804c653dc5ab93" FOREIGN KEY ("navigationTargetObjectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_29d15e273efc5804c653dc5ab93"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_NAVIGATION_TARGET_OBJECT_METADATA_ID"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "navigationTargetObjectMetadataId"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${PREVIOUS_ENGINE_KEY_COHERENCE_CHECK})`,
    );
  }
}
