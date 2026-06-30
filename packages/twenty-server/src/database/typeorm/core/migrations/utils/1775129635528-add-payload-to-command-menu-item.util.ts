import { type QueryRunner } from 'typeorm';

export const addPayloadCheckConstraintToCommandMenuItem = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`,
  );

  await queryRunner.query(
    `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL))`,
  );
};
