import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddUsageColumnsToAgentChatThread1764700000000
  implements MigrationInterface
{
  name = 'AddUsageColumnsToAgentChatThread1764700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "totalInputTokens" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "totalOutputTokens" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "contextWindowTokens" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "totalInputCredits" bigint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "totalOutputCredits" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalOutputCredits"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalInputCredits"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "contextWindowTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalOutputTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalInputTokens"`,
    );
  }
}
