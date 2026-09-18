import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Every pre-existing thread was private to its creator, so the creator
// becomes its owner participant and the author of all its user messages.
@RegisteredInstanceCommand('2.42.0', 1789717346444, { type: 'slow' })
export class BackfillAgentChatThreadParticipantsSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `INSERT INTO "core"."agentChatThreadParticipant" ("workspaceId", "threadId", "userWorkspaceId", "role", "createdAt")
       SELECT "workspaceId", "id", "userWorkspaceId", 'owner', "createdAt"
       FROM "core"."agentChatThread"
       ON CONFLICT ("threadId", "userWorkspaceId") DO NOTHING`,
    );

    await dataSource.query(
      `UPDATE "core"."agentMessage" AS "message"
       SET "authorUserWorkspaceId" = "thread"."userWorkspaceId"
       FROM "core"."agentChatThread" AS "thread"
       WHERE "message"."threadId" = "thread"."id"
         AND "message"."role" = 'user'
         AND "message"."authorUserWorkspaceId" IS NULL`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    // The schema was created by the fast command; this step only backfills.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."agentMessage" SET "authorUserWorkspaceId" = NULL`,
    );

    await queryRunner.query(
      `DELETE FROM "core"."agentChatThreadParticipant" WHERE "role" = 'owner'`,
    );
  }
}
