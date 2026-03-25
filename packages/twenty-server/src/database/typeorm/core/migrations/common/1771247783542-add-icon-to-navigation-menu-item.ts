import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIconToNavigationMenuItem1771247783542
  implements MigrationInterface
{
  name = 'AddIconToNavigationMenuItem1771247783542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "icon" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "icon"`,
    );
  }
}
