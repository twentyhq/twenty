import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransferWebhookToCore1750242261000 implements MigrationInterface {
  name = 'TransferWebhookToCore1750242261000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create core webhook table
    await queryRunner.query(
      `CREATE TABLE "core"."webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetUrl" character varying NOT NULL, "operations" text[] NOT NULL DEFAULT '{*.*}', "description" character varying, "secret" character varying NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_webhook_id" PRIMARY KEY ("id"))`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_webhook_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Add indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_webhook_workspaceId" ON "core"."webhook" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_webhook_operations" ON "core"."webhook" USING GIN ("operations")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_webhook_operations"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_webhook_workspaceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" DROP CONSTRAINT "FK_webhook_workspaceId"`,
    );
    await queryRunner.query(`DROP TABLE "core"."webhook"`);
  }
}
