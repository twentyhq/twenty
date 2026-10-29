import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793280483473)
export class AddWorkspaceChatAssistantModesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatDirectMessageAssistantMode" character varying NOT NULL DEFAULT \'MENTION_ONLY\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatInboxAssistantMode" character varying NOT NULL DEFAULT \'AUTOMATIC\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatInboxAssistantMode"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatDirectMessageAssistantMode"',
    );
  }
}
