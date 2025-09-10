import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddStreamDataToAgentChatMessage1757470059369
  implements MigrationInterface
{
  name = 'AddStreamDataToAgentChatMessage1757470059369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD "streamData" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP COLUMN "streamData"`,
    );
  }
}
