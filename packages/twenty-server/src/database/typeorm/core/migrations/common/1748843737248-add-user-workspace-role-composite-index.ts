import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserWorkspaceRoleCompositeIndex1748843737248
  implements MigrationInterface
{
  name = 'AddUserWorkspaceRoleCompositeIndex1748843737248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_WORKSPACE_ID" ON "core"."userWorkspaceRole" ("userWorkspaceId", "workspaceId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_USER_WORKSPACE_ROLE_USER_WORKSPACE_ID_WORKSPACE_ID"`,
    );
  }
}
