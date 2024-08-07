import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateActivationStatus1722256203540 implements MigrationInterface {
  name = 'UpdateActivationStatus1722256203540';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Set current column as text
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DATA TYPE text USING "activationStatus"::text`,
    );

    // Drop default value
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );

    // Drop the old enum type
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationstatus_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum" AS ENUM('PENDING_CREATION', 'ACTIVE', 'INACTIVE')`,
    );

    // Re-apply the enum type
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DATA TYPE "core"."workspace_activationStatus_enum" USING "activationStatus"::"core"."workspace_activationStatus_enum"`,
    );

    // Update default value
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set current column as text
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DATA TYPE text USING "activationStatus"::text`,
    );

    // Drop default value
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );

    // Drop the old enum type
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationstatus_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );

    // Re-apply the enum type
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DATA TYPE "core"."workspace_activationstatus_enum" USING "activationStatus"::"core"."workspace_activationstatus_enum"`,
    );

    // Update default value
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
  }
}
