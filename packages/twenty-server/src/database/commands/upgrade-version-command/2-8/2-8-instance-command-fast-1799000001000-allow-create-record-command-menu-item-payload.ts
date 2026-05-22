import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';
import {
  COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT,
  COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL,
} from 'src/engine/metadata-modules/command-menu-item/constants/command-menu-item-engine-key-coherence-constraint-sql.constant';

const LEGACY_PAYLOAD_CONSTRAINT_SQL = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL)`;

@RegisteredInstanceCommand('2.8.0', 1799000001000)
export class AllowCreateRecordCommandMenuItemPayloadFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}" CHECK (${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT_SQL})`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}"`,
    );

    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "payload" = NULL WHERE "engineComponentKey" = 'CREATE_NEW_RECORD'`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${COMMAND_MENU_ITEM_ENGINE_KEY_COHERENCE_CONSTRAINT}" CHECK (${LEGACY_PAYLOAD_CONSTRAINT_SQL})`,
    );
  }
}
