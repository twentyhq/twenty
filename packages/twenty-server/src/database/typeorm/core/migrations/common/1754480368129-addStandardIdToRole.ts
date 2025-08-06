import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStandardIdToRole1754480368129 implements MigrationInterface {
  name = 'AddStandardIdToRole1754480368129';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."role" ADD "standardId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "standardId"`,
    );
  }
}
