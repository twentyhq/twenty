import { type DataSource, type QueryRunner } from 'typeorm';

import { createCoreIndexConcurrently } from 'src/database/commands/upgrade-version-command/2-46/utils/create-core-index-concurrently.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const INDEXES = [
  {
    indexName: 'IDX_ROLE_TARGET_UNIQUE_ASSIGNED_USER_WORKSPACE',
    createIndexQuery:
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ROLE_TARGET_UNIQUE_ASSIGNED_USER_WORKSPACE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId") WHERE "isSystemSideEffect" = false',
  },
  {
    indexName: 'IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE_ROLE',
    createIndexQuery:
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE_ROLE" ON "core"."roleTarget" ("workspaceId", "userWorkspaceId", "roleId")',
  },
];

@RegisteredInstanceCommand('2.60.0', 1794922746001, { type: 'slow' })
export class AllowSystemSideEffectRoleTargetsPerUserWorkspaceSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const index of INDEXES) {
      await createCoreIndexConcurrently({ dataSource, ...index });
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const { createIndexQuery } of INDEXES) {
      await queryRunner.query(createIndexQuery);
    }

    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT IF EXISTS "IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE"',
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
