import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHotkeysToCommandMenuItems1773677851495
  implements MigrationInterface
{
  name = 'AddHotkeysToCommandMenuItems1773677851495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ADD "hotKeys" text array`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" DROP COLUMN "hotKeys"`,
    );
  }
}
