import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Partial unique index that backs the
// findOrCreateWorkspaceTransactionalChannel get-or-create with a real DB
// constraint. Without this, two concurrent first-time campaign sends both
// miss the existing-channel check and create duplicate synthetic
// WORKSPACE_TRANSACTIONAL channels for the same workspace.
@RegisteredInstanceCommand('2.9.0', 1799100020000)
export class AddWorkspaceTransactionalChannelUniqueIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_MESSAGE_CHANNEL_WORKSPACE_TRANSACTIONAL_UNIQUE" ON "core"."messageChannel" ("workspaceId") WHERE "type" = 'WORKSPACE_TRANSACTIONAL'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_MESSAGE_CHANNEL_WORKSPACE_TRANSACTIONAL_UNIQUE"`,
    );
  }
}
