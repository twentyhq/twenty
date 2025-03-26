import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceConstraint1742998832316 implements MigrationInterface {
  name = 'AddWorkspaceConstraint1742998832316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD CONSTRAINT "onboarded_workspace_requires_default_role" CHECK ("activationStatus" IN ('PENDING_CREATION', 'ONGOING_CREATION') OR "defaultRoleId" IS NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP CONSTRAINT "onboarded_workspace_requires_default_role"`,
    );
  }
}
