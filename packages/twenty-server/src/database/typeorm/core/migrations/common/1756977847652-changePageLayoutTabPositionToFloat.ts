import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class ChangePageLayoutTabPositionToFloat1756977847652
  implements MigrationInterface
{
  name = 'ChangePageLayoutTabPositionToFloat1756977847652';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "position" double precision NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."pageLayoutTab" ADD "position" integer NOT NULL DEFAULT '0'`,
    );
  }
}
