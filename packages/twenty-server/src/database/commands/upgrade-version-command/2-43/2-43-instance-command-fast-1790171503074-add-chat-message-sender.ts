import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790171503074)
export class AddChatMessageSenderFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD COLUMN IF NOT EXISTS "senderUserWorkspaceId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD COLUMN IF NOT EXISTS "senderApplicationId" uuid',
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Older servers ignore nullable columns. Keeping them preserves the sender
    // and application identity if core history is rolled back and upgraded again.
  }
}
