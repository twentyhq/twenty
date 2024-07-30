import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivationStatus1722256203539 implements MigrationInterface {
  name = 'AddActivationStatus1722256203539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationstatus_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "activationStatus" "core"."workspace_activationstatus_enum" NOT NULL DEFAULT 'INACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "activationStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationstatus_enum"`,
    );
  }
}
