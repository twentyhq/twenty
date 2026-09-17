import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Schema only; the owner rows and message authors are backfilled by the slow
// command that follows so the bulk writes do not hold the DDL lock.
@RegisteredInstanceCommand('2.42.0', 1789653152702)
export class AddAgentChatThreadParticipantsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."agentChatThreadParticipant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "threadId" uuid NOT NULL,
        "userWorkspaceId" uuid NOT NULL,
        "role" varchar NOT NULL DEFAULT 'member',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_agentChatThreadParticipant_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_PARTICIPANT_THREAD_USER_WORKSPACE_UNIQUE" ON "core"."agentChatThreadParticipant" ("threadId", "userWorkspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_PARTICIPANT_WORKSPACE_ID" ON "core"."agentChatThreadParticipant" ("workspaceId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_PARTICIPANT_THREAD_ID" ON "core"."agentChatThreadParticipant" ("threadId")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_CHAT_THREAD_PARTICIPANT_USER_WORKSPACE_ID" ON "core"."agentChatThreadParticipant" ("userWorkspaceId")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadParticipant"
       ADD CONSTRAINT "FK_70c958ec40d39b0333697d19c5a"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadParticipant"
       ADD CONSTRAINT "FK_4e72c75eb6e4d7bd139b9d9a59b"
       FOREIGN KEY ("threadId") REFERENCES "core"."agentChatThread"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThreadParticipant"
       ADD CONSTRAINT "FK_16af4c3153ef1310ca2ba085a34"
       FOREIGN KEY ("userWorkspaceId") REFERENCES "core"."userWorkspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ADD COLUMN IF NOT EXISTS "authorUserWorkspaceId" uuid`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_AGENT_MESSAGE_AUTHOR_USER_WORKSPACE_ID" ON "core"."agentMessage" ("authorUserWorkspaceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_AGENT_MESSAGE_AUTHOR_USER_WORKSPACE_ID"`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" DROP COLUMN IF EXISTS "authorUserWorkspaceId"`,
    );

    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."agentChatThreadParticipant"`,
    );
  }
}
