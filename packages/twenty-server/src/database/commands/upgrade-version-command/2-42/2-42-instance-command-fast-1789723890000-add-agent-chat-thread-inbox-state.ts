import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789723890000)
export class AddAgentChatThreadInboxStateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "status" character varying NOT NULL DEFAULT 'open'`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "snoozedUntil" timestamptz`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "assigneeUserWorkspaceId" uuid`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_STATUS" ON "core"."agentChatThread" ("workspaceId", "status")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_ASSIGNEE_USER_WORKSPACE_ID" ON "core"."agentChatThread" ("assigneeUserWorkspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadParticipant" ADD COLUMN IF NOT EXISTS "lastMentionedAt" timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadParticipant" DROP COLUMN IF EXISTS "lastMentionedAt"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_AGENT_CHAT_THREAD_ASSIGNEE_USER_WORKSPACE_ID"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_AGENT_CHAT_THREAD_STATUS"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "assigneeUserWorkspaceId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "snoozedUntil"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "status"`,
    );
  }
}
