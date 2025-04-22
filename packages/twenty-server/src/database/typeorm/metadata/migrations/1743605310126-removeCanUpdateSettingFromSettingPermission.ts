import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCanUpdateSettingFromSettingPermission1743605310126
  implements MigrationInterface
{
  name = 'RemoveCanUpdateSettingFromSettingPermission1743605310126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."settingPermission" DROP COLUMN "canUpdateSetting"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "metadata"."settingPermission" ADD "canUpdateSetting" boolean`,
    );
  }
}
