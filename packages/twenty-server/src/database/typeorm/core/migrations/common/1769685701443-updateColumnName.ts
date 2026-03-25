import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateColumnName1769685701443 implements MigrationInterface {
  name = 'UpdateColumnName1769685701443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultLogicFunctionRoleId" TO "defaultRoleId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" RENAME COLUMN "defaultRoleId" TO "defaultLogicFunctionRoleId"`,
    );
  }
}
