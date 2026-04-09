import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveContentFromAgentChatMessage1757991657472
  implements MigrationInterface
{
  name = 'RemoveContentFromAgentChatMessage1757991657472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" RENAME COLUMN "content" TO "rawContent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ALTER COLUMN "rawContent" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ALTER COLUMN "rawContent" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" RENAME COLUMN "rawContent" TO "content"`,
    );
  }
}
