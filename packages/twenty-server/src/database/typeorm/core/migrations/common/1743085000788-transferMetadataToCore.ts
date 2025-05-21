import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransferMetadataToCore1743085000788 implements MigrationInterface {
  name = 'TransferMetadataToCore1743085000788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schemaExists = await queryRunner.query(
      `SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = 'metadata')`,
    );

    if (!schemaExists[0].exists) {
      return;
    }

    const tables = await queryRunner.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'metadata' AND table_name != '_typeorm_migrations'`,
    );

    if (tables.length === 0) {
      return;
    }

    for (const table of tables) {
      const tableName = table.table_name;

      const tableExistsInCore = await queryRunner.query(
        `SELECT EXISTS(
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'core' AND table_name = '${tableName}'
        )`,
      );

      if (tableExistsInCore[0].exists) {
        continue;
      }

      // Move the table from metadata schema to core schema
      // This preserves all data, constraints, indexes, etc.
      await queryRunner.query(
        `ALTER TABLE "metadata"."${tableName}" SET SCHEMA "core"`,
      );
    }
  }

  public async down(): Promise<void> {
    // This migration is irreversible
  }
}
