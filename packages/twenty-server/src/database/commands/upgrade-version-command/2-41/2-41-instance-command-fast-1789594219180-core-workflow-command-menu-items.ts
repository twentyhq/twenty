import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789594219180)
export class CoreWorkflowCommandMenuItemsFastInstanceCommand implements FastInstanceCommand {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE core."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`);
    await queryRunner.query(`ALTER TABLE core."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND ("workflowVersionId" IS NOT NULL OR "coreWorkflowVersionId" IS NOT NULL) AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "coreWorkflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND (("payload" IS NOT NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("payload" IS NULL AND "navigationTargetObjectMetadataId" IS NOT NULL)) AND "workflowVersionId" IS NULL AND "coreWorkflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "coreWorkflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE core."commandMenuItem" DROP CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`);
    await queryRunner.query(`ALTER TABLE core."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND (("payload" IS NOT NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("payload" IS NULL AND "navigationTargetObjectMetadataId" IS NOT NULL)) AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL))`);
  }
}
