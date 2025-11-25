import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddAgentIdToAgentChatMessage1764081474225
  implements MigrationInterface
{
  name = 'AddAgentIdToAgentChatMessage1764081474225';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" ADD "agentId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'default-smart-model'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3cab3cd2160867060a2812a3d" ON "core"."agentChatMessage" ("agentId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IDX_f3cab3cd2160867060a2812a3d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'auto'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatMessage" DROP COLUMN "agentId"`,
    );
  }
}
