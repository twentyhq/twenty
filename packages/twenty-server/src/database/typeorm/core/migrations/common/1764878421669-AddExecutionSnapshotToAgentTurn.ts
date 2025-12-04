import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddExecutionSnapshotToAgentTurn1764878421669
  implements MigrationInterface
{
  name = 'AddExecutionSnapshotToAgentTurn1764878421669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" ADD "executionSnapshot" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" DROP COLUMN "executionSnapshot"`,
    );
  }
}
