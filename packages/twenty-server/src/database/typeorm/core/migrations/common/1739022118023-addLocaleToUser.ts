import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocaleToUser1739022118023 implements MigrationInterface {
  name = 'AddLocaleToUser1739022118023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."user" ADD "locale" character varying NOT NULL DEFAULT 'en'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."user" DROP COLUMN "locale"`);
  }
}
