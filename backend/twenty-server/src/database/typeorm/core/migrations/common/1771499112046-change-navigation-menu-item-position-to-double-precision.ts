import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ChangeNavigationMenuItemPositionToDoublePrecision1771499112046
  implements MigrationInterface
{
  name = 'ChangeNavigationMenuItemPositionToDoublePrecision1771499112046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "position" TYPE double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."navigationMenuItem" ALTER COLUMN "position" TYPE integer`,
    );
  }
}
