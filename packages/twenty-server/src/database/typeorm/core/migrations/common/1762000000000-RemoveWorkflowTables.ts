import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWorkflowTables1762000000000 implements MigrationInterface {
  name = 'RemoveWorkflowTables1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all workspace schemas
    const workspaceSchemas = await queryRunner.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'workspace_%'
    `);

    for (const { schema_name: schemaName } of workspaceSchemas) {
      // Drop dependent workflow tables first
      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schemaName}"."workflowVersion" CASCADE
      `);

      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schemaName}"."workflowRun" CASCADE
      `);

      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schemaName}"."workflowAutomatedTrigger" CASCADE
      `);

      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schemaName}"."workflowEventListener" CASCADE
      `);

      // Remove foreign key from timelineActivity if it exists
      await queryRunner.query(`
        DO $$
        DECLARE
          constraint_name text;
        BEGIN
          SELECT tc.constraint_name INTO constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = '${schemaName}'
            AND tc.table_name = 'timelineActivity'
            AND kcu.column_name = 'workflowId';

          IF constraint_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE "${schemaName}"."timelineActivity" DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_name);
          END IF;
        END $$;
      `);

      // Drop workflow table
      await queryRunner.query(`
        DROP TABLE IF EXISTS "${schemaName}"."workflow" CASCADE
      `);

      // Drop enum types if they exist
      await queryRunner.query(`
        DROP TYPE IF EXISTS "${schemaName}"."workflow_statuses_enum" CASCADE
      `);

      await queryRunner.query(`
        DROP TYPE IF EXISTS "${schemaName}"."workflow_createdBySource_enum" CASCADE
      `);
    }
  }

  public async down(): Promise<void> {
    // This migration is not reversible as the workflow tables were orphaned
    // and their original schema/data are unknown
  }
}
