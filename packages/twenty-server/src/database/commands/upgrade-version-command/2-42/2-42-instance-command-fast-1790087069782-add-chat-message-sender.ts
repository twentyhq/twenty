import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790087069782)
export class AddChatMessageSenderFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD "senderUserWorkspaceId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD "senderApplicationId" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" DROP COLUMN "senderApplicationId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" DROP COLUMN "senderUserWorkspaceId"',
    );
  }
}
