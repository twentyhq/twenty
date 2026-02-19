import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLinkToNavigationMenuItem1770256542802
  implements MigrationInterface
{
  name = 'AddLinkToNavigationMenuItem1770256542802';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "link" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "link"`,
    );
  }
}
