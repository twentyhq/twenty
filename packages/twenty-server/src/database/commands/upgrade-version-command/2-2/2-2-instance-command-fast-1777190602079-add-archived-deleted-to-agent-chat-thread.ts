import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.2.0', 1777190602079)
export class AddArchivedDeletedToAgentChatThreadFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."agentChatThread" ADD "archivedAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('ALTER TABLE "core"."agentChatThread" ADD "deletedAt" TIMESTAMP WITH TIME ZONE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."agentChatThread" DROP COLUMN "deletedAt"');
    await queryRunner.query('ALTER TABLE "core"."agentChatThread" DROP COLUMN "archivedAt"');
  }
}
