import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRoleApplicabilityFields1756434280823
  implements MigrationInterface
{
  name = 'AddRoleApplicabilityFields1756434280823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canBeAssignedToUsers" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canBeAssignedToAgents" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" ADD "canBeAssignedToApiKeys" boolean NOT NULL DEFAULT true`,
    );

    await queryRunner.query(
      `UPDATE "core"."role" SET "canBeAssignedToUsers" = true, "canBeAssignedToAgents" = true, "canBeAssignedToApiKeys" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToApiKeys"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToAgents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToUsers"`,
    );
  }
}
