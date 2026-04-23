import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class FixAiEntityTimestampsToTimestamptz1771600000000
  implements MigrationInterface
{
  name = 'FixAiEntityTimestampsToTimestamptz1771600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ALTER COLUMN "updatedAt" TYPE TIMESTAMP WITH TIME ZONE USING "updatedAt"::timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::timestamptz`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurnEvaluation" ALTER COLUMN "createdAt" TYPE TIMESTAMP WITH TIME ZONE USING "createdAt"::timestamptz`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurnEvaluation" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentTurn" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessagePart" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentMessage" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ALTER COLUMN "updatedAt" TYPE TIMESTAMP USING "updatedAt"::timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agentChatThread" ALTER COLUMN "createdAt" TYPE TIMESTAMP USING "createdAt"::timestamp`,
    );
  }
}
