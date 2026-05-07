import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777308014234)
export class AddUpgradeMigrationWorkspaceIdIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_UPGRADE_MIGRATION_WORKSPACE_ID_NAME_ATTEMPT" ON "core"."upgradeMigration" ("workspaceId", "name", "attempt") WHERE "workspaceId" IS NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_UPGRADE_MIGRATION_WORKSPACE_ID_NAME_ATTEMPT"',
    );
  }
}
