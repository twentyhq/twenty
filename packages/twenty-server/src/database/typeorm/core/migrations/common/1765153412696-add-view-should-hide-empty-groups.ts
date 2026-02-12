import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewShouldHideEmptyGroups1765153412696
  implements MigrationInterface
{
  name = 'AddViewShouldHideEmptyGroups1765153412696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "shouldHideEmptyGroups" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "shouldHideEmptyGroups"`,
    );
  }
}
