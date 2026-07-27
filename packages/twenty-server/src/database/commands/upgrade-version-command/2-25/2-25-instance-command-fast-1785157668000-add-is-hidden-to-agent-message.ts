import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1785157668000)
export class AddIsHiddenToAgentMessageFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" ADD COLUMN IF NOT EXISTS "isHidden" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_MESSAGE_THREAD_ID_IS_HIDDEN_UNIQUE" ON "core"."agentMessage" ("threadId") WHERE "isHidden" = true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_AGENT_MESSAGE_THREAD_ID_IS_HIDDEN_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentMessage" DROP COLUMN IF EXISTS "isHidden"',
    );
  }
}
