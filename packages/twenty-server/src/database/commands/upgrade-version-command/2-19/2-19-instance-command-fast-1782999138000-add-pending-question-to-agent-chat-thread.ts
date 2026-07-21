import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.19.0', 1782999138000)
export class AddPendingQuestionMessageIdToAgentChatThreadFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "pendingQuestionMessageId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "pendingQuestionMessageId"`,
    );
  }
}
