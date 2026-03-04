import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddEditWindowMinutes1772591146793 implements MigrationInterface {
  name = 'AddEditWindowMinutes1772591146793';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "editWindowMinutes" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" ADD "editWindowMinutes" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."objectPermission" DROP COLUMN "editWindowMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "editWindowMinutes"`,
    );
  }
}
