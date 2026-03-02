import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddColorToNavigationMenuItem1771146443209
  implements MigrationInterface
{
  name = 'AddColorToNavigationMenuItem1771146443209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "color" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "color"`,
    );
  }
}
