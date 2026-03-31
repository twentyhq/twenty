import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIntegrationTable1743510000000 implements MigrationInterface {
  name = 'CreateIntegrationTable1743510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "integration_provider_enum" AS ENUM (
        'WHATSAPP', 
        'SLACK', 
        'NOTION', 
        'MERCADO_PAGO', 
        'TWILIO', 
        'TELEGRAM',
        'HUBSPOT',
        'LINEAR',
        'STRIPE'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "integration_status_enum" AS ENUM (
        'ACTIVE', 
        'INACTIVE', 
        'ERROR', 
        'PENDING'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "core"."integration" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "workspaceId" uuid NOT NULL,
        "provider" "integration_provider_enum" NOT NULL,
        "status" "integration_status_enum" NOT NULL DEFAULT 'PENDING',
        "accessToken" varchar,
        "refreshToken" varchar,
        "apiKey" varchar,
        "apiSecret" varchar,
        "webhookUrl" varchar,
        "settings" jsonb,
        "lastSyncAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        "updatedAt" timestamptz NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_integration_workspace" 
          FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_INTEGRATION_WORKSPACE_PROVIDER" 
      ON "core"."integration" ("workspaceId", "provider")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "IDX_INTEGRATION_WORKSPACE_PROVIDER"
    `);

    await queryRunner.query(`
      DROP TABLE "core"."integration"
    `);

    await queryRunner.query(`
      DROP TYPE "integration_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "integration_provider_enum"
    `);
  }
}
