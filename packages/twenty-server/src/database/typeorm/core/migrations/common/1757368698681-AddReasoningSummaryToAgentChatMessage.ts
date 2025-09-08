import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddReasoningSummaryToAgentChatMessage1757368698681
  implements MigrationInterface
{
  name = 'AddReasoningSummaryToAgentChatMessage1757368698681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD "reasoningSummary" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP COLUMN "reasoningSummary"`,
    );
  }
}
