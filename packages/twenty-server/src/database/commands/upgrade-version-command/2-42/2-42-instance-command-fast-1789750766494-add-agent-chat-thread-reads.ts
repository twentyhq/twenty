import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789750766494)
export class AddAgentChatThreadReadsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatThreadRead" (
         "id" uuid NOT NULL DEFAULT public.uuid_generate_v4(),
         "workspaceId" uuid NOT NULL,
         "threadId" uuid NOT NULL,
         "userWorkspaceId" uuid NOT NULL,
         "lastReadAt" timestamptz NOT NULL,
         "lastReadMessageId" uuid,
         CONSTRAINT "PK_agent_chat_thread_read" PRIMARY KEY ("id")
       )`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_READ_WORKSPACE_ID" ON "core"."agentChatThreadRead" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_READ_THREAD_ID" ON "core"."agentChatThreadRead" ("threadId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_READ_USER_WORKSPACE_ID" ON "core"."agentChatThreadRead" ("userWorkspaceId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_READ_THREAD_USER_WORKSPACE_UNIQUE" ON "core"."agentChatThreadRead" ("threadId", "userWorkspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead" DROP CONSTRAINT IF EXISTS "FK_6b566bb4e0a58c34a355bbdedf5"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead"
       ADD CONSTRAINT "FK_6b566bb4e0a58c34a355bbdedf5"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead" DROP CONSTRAINT IF EXISTS "FK_9b6f82801bcab52e6bd48f31bd6"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead"
       ADD CONSTRAINT "FK_9b6f82801bcab52e6bd48f31bd6"
       FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead" DROP CONSTRAINT IF EXISTS "FK_957ba31ca1a57c168adb79bf594"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadRead"
       ADD CONSTRAINT "FK_957ba31ca1a57c168adb79bf594"
       FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "assistantLastReadAt" timestamptz`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "assistantLastReadMessageId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "assistantLastReadMessageId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "assistantLastReadAt"`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "core"."agentChatThreadRead"`);
  }
}
