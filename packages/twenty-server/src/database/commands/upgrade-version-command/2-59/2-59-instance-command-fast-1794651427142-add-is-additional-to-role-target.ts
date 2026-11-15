import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794651427142)
export class AddIsAdditionalToRoleTargetFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD "isAdditional" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE"',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_ROLE_TARGET_UNIQUE_ASSIGNED_USER_WORKSPACE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId") WHERE "isAdditional" = false',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE_ROLE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId", "roleId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."roleTarget" WHERE "isAdditional" = true',
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
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP COLUMN "isAdditional"',
    );
  }
}
