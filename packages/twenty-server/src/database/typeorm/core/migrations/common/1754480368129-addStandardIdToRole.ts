import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardIdToRole1754480368129 implements MigrationInterface {
  name = 'AddStandardIdToRole1754480368129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."role" ADD "standardId" uuid`);

    await queryRunner.query(
      `UPDATE "core"."role" SET "standardId" = '20202020-0001-0001-0001-000000000001' WHERE "label" = 'Admin'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "core"."role" SET "standardId" = NULL`);

    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "standardId"`,
    );
  }
}
