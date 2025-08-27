import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddStandardIdToAgent1754923039348 implements MigrationInterface {
  name = 'AddStandardIdToAgent1754923039348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."agent" ADD "standardId" uuid`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" DROP COLUMN "standardId"`,
    );
  }
}
