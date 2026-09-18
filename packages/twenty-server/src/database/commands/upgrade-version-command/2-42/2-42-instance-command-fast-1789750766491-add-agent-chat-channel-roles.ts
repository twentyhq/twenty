import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789750766491)
export class AddAgentChatChannelRolesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannel" ADD COLUMN IF NOT EXISTS "description" text`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatChannelRole" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "channelId" uuid NOT NULL,
        "roleId" uuid NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentChatChannelRole_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE" ON "core"."agentChatChannelRole" ("channelId", "roleId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID" ON "core"."agentChatChannelRole" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID" ON "core"."agentChatChannelRole" ("channelId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_CHANNEL_ROLE_ROLE_ID" ON "core"."agentChatChannelRole" ("roleId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT IF EXISTS "FK_05411d9312a897a828ad3e749ce"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole"
       ADD CONSTRAINT "FK_05411d9312a897a828ad3e749ce"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT IF EXISTS "FK_312b5b71997bc0556d4f8c489c6"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole"
       ADD CONSTRAINT "FK_312b5b71997bc0556d4f8c489c6"
       FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT IF EXISTS "FK_e01d14cd9ae854f33c70a6385da"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannelRole"
       ADD CONSTRAINT "FK_e01d14cd9ae854f33c70a6385da"
       FOREIGN KEY ("roleId") REFERENCES "core"."role"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentChatChannelRole"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatChannel" DROP COLUMN IF EXISTS "description"`,
    );
  }
}
