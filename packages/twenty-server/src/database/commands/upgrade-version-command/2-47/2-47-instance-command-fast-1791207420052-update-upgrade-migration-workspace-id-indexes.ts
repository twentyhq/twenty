import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.47.0', 1791207420052)
export class UpdateUpgradeMigrationWorkspaceIdIndexesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_UPGRADE_MIGRATION_WORKSPACE_ID_CREATED_AT" ON "core"."upgradeMigration" ("workspaceId", "createdAt")',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_upgradeMigration_workspaceId_name_attempt"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_upgradeMigration_workspaceId_name_attempt" ON "core"."upgradeMigration" ("workspaceId", "name", "attempt") WHERE "workspaceId" IS NOT NULL',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_UPGRADE_MIGRATION_WORKSPACE_ID_CREATED_AT"',
    );
  }
}
