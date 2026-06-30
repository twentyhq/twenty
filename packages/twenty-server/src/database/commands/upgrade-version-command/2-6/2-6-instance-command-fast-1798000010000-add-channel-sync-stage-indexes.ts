import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const MESSAGE_CHANNEL_INDEX_NAME =
  'IDX_MESSAGE_CHANNEL_WORKSPACE_ID_SYNC_ENABLED_SYNC_STAGE';
const CALENDAR_CHANNEL_INDEX_NAME =
  'IDX_CALENDAR_CHANNEL_WORKSPACE_ID_SYNC_ENABLED_SYNC_STAGE';

@RegisteredInstanceCommand('2.6.0', 1798000010000)
export class AddChannelSyncStageIndexesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${MESSAGE_CHANNEL_INDEX_NAME}" ON "core"."messageChannel" ("workspaceId", "isSyncEnabled", "syncStage")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "${CALENDAR_CHANNEL_INDEX_NAME}" ON "core"."calendarChannel" ("workspaceId", "isSyncEnabled", "syncStage")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${CALENDAR_CHANNEL_INDEX_NAME}"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."${MESSAGE_CHANNEL_INDEX_NAME}"`,
    );
  }
}
