import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const ENGINE_KEY_COHERENCE_CHECK_NAME = 'CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE';

const PREVIOUS_ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND "payload" IS NOT NULL AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL)`;

// NAVIGATION rows are discriminated by payload OR target: object rows carry a
// null payload and a navigationTargetObjectMetadataId, path rows the reverse.
// The branch is an OR, not an exclusive-or, because legacy rows keep both a
// { objectMetadataItemId } payload and the 2-35-backfilled target until the
// same-version payload rewrite workspace command runs after this migration.
const ENGINE_KEY_COHERENCE_CHECK = `("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL) OR ("engineComponentKey" = 'NAVIGATION' AND ("payload" IS NOT NULL OR "navigationTargetObjectMetadataId" IS NOT NULL) AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER', 'NAVIGATION') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "payload" IS NULL AND "navigationTargetObjectMetadataId" IS NULL)`;

@RegisteredInstanceCommand('2.38.0', 1788254449812)
export class RelaxNavigationPayloadCheckFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${ENGINE_KEY_COHERENCE_CHECK})`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "${ENGINE_KEY_COHERENCE_CHECK_NAME}"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "${ENGINE_KEY_COHERENCE_CHECK_NAME}" CHECK (${PREVIOUS_ENGINE_KEY_COHERENCE_CHECK})`,
    );
  }
}
