import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateRoleColumns1765206100942 implements MigrationInterface {
  name = 'UpdateRoleColumns1765206100942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" DROP COLUMN "targetApplicationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "defaultServerlessFunctionRoleId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN "defaultServerlessFunctionRoleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTarget" ADD "targetApplicationId" uuid`,
    );
  }
}
