import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TABLES = [
  'applicationVariable',
  'indexFieldMetadata',
  'twoFactorAuthenticationMethod',
  'agentMessagePart',
  'agentTurnEvaluation',
  'agentChatThread',
  'agentTurn',
  'agentMessage',
];

@RegisteredInstanceCommand('1.22.0', 1775758621017)
export class AddWorkspaceIdToIndirectEntitiesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "workspaceId" uuid`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "workspaceId"`,
      );
    }
  }
}
