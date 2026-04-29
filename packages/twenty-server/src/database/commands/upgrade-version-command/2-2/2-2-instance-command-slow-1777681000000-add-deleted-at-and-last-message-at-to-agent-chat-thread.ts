import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.2.0', 1777681000000, { type: 'slow' })
export class AddDeletedAtAndLastMessageAtToAgentChatThreadSlowInstanceCommand
  implements SlowInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" ADD "deletedAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" ADD "lastMessageAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_AGENT_CHAT_THREAD_ID_DELETED_AT" ON "core"."agentChatThread" ("id", "deletedAt") ',
    );
  }

  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."agentChatThread" AS thread
          SET "lastMessageAt" = latest."lastMessageAt"
         FROM (
           SELECT "threadId", MAX("createdAt") AS "lastMessageAt"
             FROM "core"."agentMessage"
            GROUP BY "threadId"
         ) AS latest
        WHERE thread."id" = latest."threadId"
          AND thread."lastMessageAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_AGENT_CHAT_THREAD_ID_DELETED_AT"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" DROP COLUMN "lastMessageAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatThread" DROP COLUMN "deletedAt"',
    );
  }
}
