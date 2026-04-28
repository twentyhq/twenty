import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddLogoToApplication1774000000000 implements MigrationInterface {
  name = 'AddLogoToApplication1774000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."application" ADD "logo" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "logo"`,
    );
  }
}
