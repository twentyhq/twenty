import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToAgentMessage1775001600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."agentMessage_status_enum" AS ENUM ('queued', 'sent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ADD COLUMN "status" "core"."agentMessage_status_enum" NOT NULL DEFAULT 'sent'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ALTER COLUMN "turnId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ADD COLUMN "processedAt" TIMESTAMPTZ`,
    );
    await queryRunner.query(
      `UPDATE "core"."agentMessage" SET "processedAt" = "createdAt" WHERE "status" = 'sent'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" DROP COLUMN "processedAt"`,
    );
    // Queued messages have turnId=NULL. They must be deleted before
    // restoring the NOT NULL constraint on turnId.
    await queryRunner.query(
      `DELETE FROM "core"."agentMessage" WHERE "turnId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ALTER COLUMN "turnId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" DROP COLUMN "status"`,
    );
    await queryRunner.query(`DROP TYPE "core"."agentMessage_status_enum"`);
  }
}
