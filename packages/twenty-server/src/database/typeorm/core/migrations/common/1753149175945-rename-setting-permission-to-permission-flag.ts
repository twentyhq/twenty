import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSettingPermissionToPermissionFlag1753149175945
  implements MigrationInterface
{
  name = 'RenameSettingPermissionToPermissionFlag1753149175945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" RENAME TO "flag"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE" RENAME TO "IDX_PERMISSION_FLAG_PERMISSION_FLAG_ROLE_ID_UNIQUE"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."flag" RENAME TO "settingPermission"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_PERMISSION_FLAG_PERMISSION_FLAG_ROLE_ID_UNIQUE" RENAME TO "IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE"`,
    );
  }
}
