import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddConversationSizeToAgentChatThread1770400000000
  implements MigrationInterface
{
  name = 'AddConversationSizeToAgentChatThread1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "conversationSize" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "conversationSize"`,
    );
  }
}
