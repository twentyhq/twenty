import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddViewTranslationSupport1754755060574
  implements MigrationInterface
{
  name = 'AddViewTranslationSupport1754755060574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "standardOverrides" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "isCustom" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "isCustom"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "standardOverrides"`,
    );
  }
}
