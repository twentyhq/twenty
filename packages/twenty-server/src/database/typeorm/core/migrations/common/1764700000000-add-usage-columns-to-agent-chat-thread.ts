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
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "totalTokens" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "contextWindowTokens" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "inputCostPer1kTokensInCents" numeric(10,6)`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ADD COLUMN "outputCostPer1kTokensInCents" numeric(10,6)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "outputCostPer1kTokensInCents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "inputCostPer1kTokensInCents"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "contextWindowTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalOutputTokens"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" DROP COLUMN "totalInputTokens"`,
    );
  }
}
