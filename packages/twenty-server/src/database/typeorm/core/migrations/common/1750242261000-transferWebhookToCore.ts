import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransferWebhookToCore1750242261000 implements MigrationInterface {
  name = 'TransferWebhookToCore1750242261000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if any workspace schemas exist
    const workspaceSchemas = await queryRunner.query(
      `SELECT schema_name FROM information_schema.schemata 
       WHERE schema_name LIKE 'workspace_%'`,
    );

    if (workspaceSchemas.length === 0) return;

    // Create core webhook table
    await queryRunner.query(
      `CREATE TABLE "core"."webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "targetUrl" character varying NOT NULL, "operations" text[] NOT NULL DEFAULT '{*.*}', "description" character varying, "secret" character varying NOT NULL, "workspaceId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_webhook_id" PRIMARY KEY ("id"))`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "core"."webhook" ADD CONSTRAINT "FK_webhook_workspaceId" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Transfer webhook data from each workspace schema to core
    for (const { schema_name: schemaName } of workspaceSchemas) {
      const tableExists = await queryRunner.query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = '${schemaName}' AND table_name = 'webhook'
        )`,
      );

      if (tableExists[0].exists) {
        // Convert schema name back to workspace UUID
        // Schema format: workspace_<base36_encoded_uuid>
        let base36Id = schemaName.replace('workspace_', '');

        // Handle dev UUIDs that start with 'twenty_'
        const isDevId = base36Id.startsWith('twenty_');

        if (isDevId) {
          base36Id = base36Id.replace('twenty_', '');
        }

        // Convert base36 back to hex
        const base10Number = BigInt(parseInt(base36Id, 36));
        const hexString = base10Number.toString(16).padStart(32, '0');

        // Add UUID dashes back
        let workspaceId = [
          hexString.slice(0, 8),
          hexString.slice(8, 12),
          hexString.slice(12, 16),
          hexString.slice(16, 20),
          hexString.slice(20, 32),
        ].join('-');

        // Re-add 'twenty-' prefix for dev UUIDs
        if (isDevId) {
          workspaceId = `twenty-${workspaceId}`;
        }

        // Copy data to core schema with workspaceId
        await queryRunner.query(`
          INSERT INTO "core"."webhook" 
          ("id", "targetUrl", "operations", "description", "secret", "workspaceId", "createdAt", "updatedAt", "deletedAt")
          SELECT 
            "id", 
            "targetUrl", 
            "operations", 
            "description", 
            "secret", 
            '${workspaceId}'::uuid,
            "createdAt", 
            "updatedAt", 
            "deletedAt"
          FROM "${schemaName}"."webhook"
          ON CONFLICT ("id") DO NOTHING
        `);

        // Drop the workspace table
        await queryRunner.query(`DROP TABLE "${schemaName}"."webhook"`);
      }
    }

    // Add indexes for performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_webhook_workspaceId" ON "core"."webhook" ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_webhook_operations" ON "core"."webhook" USING GIN ("operations")`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // This migration is irreversible - too complex to safely rollback
    // workspace_xxx schemas may not exist anymore
  }
}
