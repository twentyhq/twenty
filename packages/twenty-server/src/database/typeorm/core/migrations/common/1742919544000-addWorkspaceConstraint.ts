import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceConstraint1711378152000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "core"."workspace" 
            ADD CONSTRAINT workspace_active_requires_default_role 
            CHECK (
                "activationStatus" != 'ACTIVE' OR 
                ("activationStatus" = 'ACTIVE' AND "defaultRoleId" IS NOT NULL)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "core"."workspace" 
            DROP CONSTRAINT workspace_active_requires_default_role;
        `);
  }
}
