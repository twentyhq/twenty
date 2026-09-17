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
       ADD CONSTRAINT "FK_06abd1f6b49da7e9d621edbb34d"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannel"
       ADD CONSTRAINT "FK_4c27e9ecd8f477466332d3545a3"
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
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_MEMBER_CHANNEL_USER_WORKSPACE_UNIQUE" ON "core"."agentChatChannelMember" ("channelId", "userWorkspaceId")`,
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
       ADD CONSTRAINT "FK_772eaebbcd16c07f65fc4e66c44"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelMember"
       ADD CONSTRAINT "FK_965f596c773333c1292feecdc63"
       FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelMember"
       ADD CONSTRAINT "FK_1c675bde6b319647903e2c9ae6a"
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
       ADD CONSTRAINT "FK_ccc443637199a66cd10b123262f"
       FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id")
       ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP CONSTRAINT IF EXISTS "FK_ccc443637199a66cd10b123262f"`,
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
