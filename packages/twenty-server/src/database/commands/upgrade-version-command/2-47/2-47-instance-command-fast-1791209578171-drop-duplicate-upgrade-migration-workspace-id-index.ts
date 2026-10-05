import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.47.0', 1791209578171)
export class DropDuplicateUpgradeMigrationWorkspaceIdIndexFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_upgradeMigration_workspaceId_name_attempt"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_upgradeMigration_workspaceId_name_attempt" ON "core"."upgradeMigration" ("workspaceId", "name", "attempt") WHERE "workspaceId" IS NOT NULL',
    );
  }
}
