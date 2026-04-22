import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.23.0', 1776168404836)
export class AddPageLayoutIdToCommandMenuItemFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "pageLayoutId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_COMMAND_MENU_ITEM_PAGE_LAYOUT_ID_WORKSPACE_ID" ON "core"."commandMenuItem" ("pageLayoutId", "workspaceId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD CONSTRAINT "FK_8577be6253969364b6725b807b4" FOREIGN KEY ("pageLayoutId") REFERENCES "core"."pageLayout"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP CONSTRAINT "FK_8577be6253969364b6725b807b4"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_COMMAND_MENU_ITEM_PAGE_LAYOUT_ID_WORKSPACE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "pageLayoutId"',
    );
  }
}
