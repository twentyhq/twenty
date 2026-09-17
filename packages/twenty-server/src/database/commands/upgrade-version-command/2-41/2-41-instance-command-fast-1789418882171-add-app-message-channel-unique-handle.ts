import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.41.0', 1789418882171)
export class AddAppMessageChannelUniqueHandleFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_MESSAGE_CHANNEL_APP_CONNECTED_ACCOUNT_HANDLE_UNIQUE" ON "core"."messageChannel" ("workspaceId", "connectedAccountId", "handle") WHERE "type" = \'APP\'');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "core"."IDX_MESSAGE_CHANNEL_APP_CONNECTED_ACCOUNT_HANDLE_UNIQUE"');
  }
}
