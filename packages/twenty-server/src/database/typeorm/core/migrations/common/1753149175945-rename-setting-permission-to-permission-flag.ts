import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSettingPermissionToPermissionFlag1753149175945
  implements MigrationInterface
{
  name = 'RenameSettingPermissionToPermissionFlag1753149175945';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."settingPermission" RENAME TO "permissionFlag"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME COLUMN "setting" TO "flag"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME CONSTRAINT "IDX_SETTING_PERMISSION_SETTING_ROLE_ID_UNIQUE" TO "IDX_PERMISSION_FLAG_FLAG_ROLE_ID_UNIQUE"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME COLUMN "flag" TO "setting"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" RENAME TO "settingPermission"`,
    );
  }
}
