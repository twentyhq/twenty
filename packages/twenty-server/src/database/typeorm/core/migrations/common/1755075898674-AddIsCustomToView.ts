import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddIsCustomToView1755075898674 implements MigrationInterface {
  name = 'AddIsCustomToView1755075898674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "isCustom" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "isCustom"`);
  }
}
