import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789647999774)
export class AddAgentChatChannelsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatChannel" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "visibility" varchar NOT NULL DEFAULT 'public',
        "targetObjectMetadataId" uuid,
        "targetRecordId" uuid,
        "createdByUserWorkspaceId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentChatChannel_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_NAME_UNIQUE" ON "core"."agentChatChannel" ("workspaceId", "name")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID" ON "core"."agentChatChannel" ("workspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannel"
       ADD CONSTRAINT "FK_AGENT_CHAT_CHANNEL_WORKSPACE_ID"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannel"
       ADD CONSTRAINT "FK_AGENT_CHAT_CHANNEL_CREATED_BY_USER_WORKSPACE_ID"
       FOREIGN KEY ("createdByUserWorkspaceId") REFERENCES "core"."userWorkspace"("id")
       ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatChannelMember" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "channelId" uuid NOT NULL,
        "userWorkspaceId" uuid NOT NULL,
        "role" varchar NOT NULL DEFAULT 'member',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentChatChannelMember_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_MEMBER_CHANNEL_ID_USER_WORKSPACE_ID_UNIQUE" ON "core"."agentChatChannelMember" ("channelId", "userWorkspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_MEMBER_WORKSPACE_ID" ON "core"."agentChatChannelMember" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_MEMBER_CHANNEL_ID" ON "core"."agentChatChannelMember" ("channelId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_MEMBER_USER_WORKSPACE_ID" ON "core"."agentChatChannelMember" ("userWorkspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelMember"
       ADD CONSTRAINT "FK_AGENT_CHAT_CHANNEL_MEMBER_WORKSPACE_ID"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelMember"
       ADD CONSTRAINT "FK_AGENT_CHAT_CHANNEL_MEMBER_CHANNEL_ID"
       FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelMember"
       ADD CONSTRAINT "FK_AGENT_CHAT_CHANNEL_MEMBER_USER_WORKSPACE_ID"
       FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "channelId" uuid`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_CHANNEL_ID" ON "core"."agentChatThread" ("channelId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread"
       ADD CONSTRAINT "FK_AGENT_CHAT_THREAD_CHANNEL_ID"
       FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id")
       ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT IF EXISTS "FK_AGENT_CHAT_THREAD_CHANNEL_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_AGENT_CHAT_THREAD_CHANNEL_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "channelId"`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentChatChannelMember"`,
    );

    await queryRunner.query(`DROP TABLE IF EXISTS "core"."agentChatChannel"`);
  }
}
