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
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "FK_0b70755f23a3705f1bea0ddc7d4"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "FK_8febe85bd7aac55de81b1c51140" FOREIGN KEY ("agentId") REFERENCES "core"."agent"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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

    await queryRunner.query(
      `CREATE INDEX "IDX_ROLE_TARGETS_AGENT_ID" ON "core"."roleTargets" ("agentId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("userWorkspaceId", "roleId", "agentId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "FK_15066df4c077d783a5e21934909" FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_15066df4c077d783a5e21934909"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "FK_d5838ba43033ee6266d8928d7d7"`,
    );

    await queryRunner.query(`DROP INDEX "core"."IDX_ROLE_TARGETS_AGENT_ID"`);

    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" DROP CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."roleTargets" ADD CONSTRAINT "IDX_ROLE_TARGETS_UNIQUE" UNIQUE ("userWorkspaceId", "roleId")`,
    );

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
      `ALTER TABLE "core"."userWorkspaceRole" DROP CONSTRAINT "FK_8febe85bd7aac55de81b1c51140"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ADD CONSTRAINT "FK_0b70755f23a3705f1bea0ddc7d4" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" ALTER COLUMN "userWorkspaceId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspaceRole" DROP COLUMN "agentId"`,
    );
  }
}
