import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserWorkspaceRoleToRoleTargets1749000000000
  implements MigrationInterface
{
  name = 'RenameUserWorkspaceRoleToRoleTargets1749000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD "agentId" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ALTER COLUMN "userWorkspaceId" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "FK_role_targets_agent_id" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "CHK_role_targets_either_agent_or_user" CHECK (("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL))`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" RENAME TO "roleTargets"`,
    );

    await queryRunner.query(
      `ALTER INDEX "core"."IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_ROLE_ID_UNIQUE" RENAME TO "IDX_ROLE_TARGETS_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_WORKSPACE_ID" RENAME TO "IDX_ROLE_TARGETS_WORKSPACE_ID"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" RENAME TO "userWorkspaceRole"`,
    );

    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_UNIQUE" RENAME TO "IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_ROLE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER INDEX "core"."IDX_ROLE_TARGETS_WORKSPACE_ID" RENAME TO "IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_WORKSPACE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "CHK_role_targets_either_agent_or_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "FK_role_targets_agent_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP COLUMN "agentId"`,
    );
  }
}
