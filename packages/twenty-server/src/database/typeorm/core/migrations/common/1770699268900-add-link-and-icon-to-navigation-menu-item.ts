import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLinkAndIconToNavigationMenuItem1770699268900
  implements MigrationInterface
{
  name = 'AddLinkAndIconToNavigationMenuItem1770699268900';

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
