import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { addPayloadCheckConstraintToCommandMenuItem } from 'src/database/typeorm/core/migrations/utils/1775129635528-add-payload-to-command-menu-item.util';

export class AddPayloadToCommandMenuItem1775129635528
  implements MigrationInterface
{
  name = 'AddPayloadToCommandMenuItem1775129635528';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD "payload" jsonb`,
    );

    const savepointName =
      'sp_add_payload_check_constraint_to_command_menu_item';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await addPayloadCheckConstraintToCommandMenuItem(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // oxlint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddPayloadToCommandMenuItem1775129635528',
          rollbackError,
        );
        throw rollbackError;
      }

      // oxlint-disable-next-line no-console
      console.error(
        'Swallowing AddPayloadToCommandMenuItem1775129635528 error',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_CMD_MENU_ITEM_ENGINE_KEY_COHERENCE" CHECK (("engineComponentKey" = 'TRIGGER_WORKFLOW_VERSION' AND "workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL) OR ("engineComponentKey" = 'FRONT_COMPONENT_RENDERER' AND "frontComponentId" IS NOT NULL AND "workflowVersionId" IS NULL) OR ("engineComponentKey" NOT IN ('TRIGGER_WORKFLOW_VERSION', 'FRONT_COMPONENT_RENDERER') AND "workflowVersionId" IS NULL AND "frontComponentId" IS NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN "payload"`,
    );
  }
}
