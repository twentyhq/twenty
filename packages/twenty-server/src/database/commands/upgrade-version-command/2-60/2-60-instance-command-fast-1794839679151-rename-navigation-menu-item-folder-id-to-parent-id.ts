import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.60.0', 1794839679151)
export class RenameNavigationMenuItemFolderIdToParentIdFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" RENAME COLUMN "folderId" TO "parentId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" RENAME CONSTRAINT "FK_175fc64110c36793eaf9765d1c6" TO "FK_ff45ab0f2035e907848cd47b1f4"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_NAVIGATION_MENU_ITEM_FOLDER_ID_WORKSPACE_ID" RENAME TO "IDX_NAVIGATION_MENU_ITEM_PARENT_ID_WORKSPACE_ID"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_NAVIGATION_MENU_ITEM_PARENT_ID_WORKSPACE_ID" RENAME TO "IDX_NAVIGATION_MENU_ITEM_FOLDER_ID_WORKSPACE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" RENAME CONSTRAINT "FK_ff45ab0f2035e907848cd47b1f4" TO "FK_175fc64110c36793eaf9765d1c6"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" RENAME COLUMN "parentId" TO "folderId"',
    );
  }
}
