import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardFrontComponentKeyToCommandMenuItem1772932588833
  implements MigrationInterface
{
  name = 'AddStandardFrontComponentKeyToCommandMenuItem1772932588833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD "standardFrontComponentKey" character varying`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "CHK_command_menu_item_workflow_or_front_component"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_command_menu_item_workflow_or_front_component_or_standard_key" CHECK (("workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL AND "standardFrontComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NOT NULL AND "standardFrontComponentKey" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NULL AND "standardFrontComponentKey" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT IF EXISTS "CHK_command_menu_item_workflow_or_front_component_or_standard_key"`,
    );

    await queryRunner.query(
      `DELETE FROM "core"."commandMenuItem" WHERE "standardFrontComponentKey" IS NOT NULL AND "frontComponentId" IS NULL AND "workflowVersionId" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN "standardFrontComponentKey"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "CHK_command_menu_item_workflow_or_front_component" CHECK (("workflowVersionId" IS NOT NULL AND "frontComponentId" IS NULL) OR ("workflowVersionId" IS NULL AND "frontComponentId" IS NOT NULL))`,
    );
  }
}
