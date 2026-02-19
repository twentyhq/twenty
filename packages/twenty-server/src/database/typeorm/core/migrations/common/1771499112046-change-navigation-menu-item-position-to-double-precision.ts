import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ChangeNavigationMenuItemPositionToDoublePrecision1771499112046
  implements MigrationInterface
{
  name = 'ChangeNavigationMenuItemPositionToDoublePrecision1771499112046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "position" double precision NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ADD "position" integer NOT NULL`,
    );
  }
}
