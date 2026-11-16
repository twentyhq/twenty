import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.60.0', 1794850068948)
export class AllowSystemSideEffectRoleTargetsPerUserWorkspaceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_ROLE_TARGET_UNIQUE_ASSIGNED_USER_WORKSPACE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId") WHERE "isSystemSideEffect" = false',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE_ROLE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId", "roleId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."roleTarget" WHERE "isSystemSideEffect" = true',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE_ROLE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_ROLE_TARGET_UNIQUE_ASSIGNED_USER_WORKSPACE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE" UNIQUE ("workspaceId", "userWorkspaceId")',
    );
  }
}
