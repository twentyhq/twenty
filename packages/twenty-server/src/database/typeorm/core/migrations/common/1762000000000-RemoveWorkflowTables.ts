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
      await queryRunner.query(
        `DROP TABLE IF EXISTS $1."workflowVersion" CASCADE`,
        [schemaName]
      );

      await queryRunner.query(
        `DROP TABLE IF EXISTS $1."workflowEventListener" CASCADE`,
        [schemaName]
      );

      await queryRunner.query(
        `DROP TABLE IF EXISTS $1."workflowRun" CASCADE`,
        [schemaName]
      );

      await queryRunner.query(
        `DROP TABLE IF EXISTS $1."workflowAction" CASCADE`,
        [schemaName]
      );

      // Drop constraints referencing workflow table
      await queryRunner.query(
        `
        DO $$
        DECLARE
          constraint_rec RECORD;
        BEGIN
          FOR constraint_rec IN
            SELECT tc.constraint_name, tc.table_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_schema = $1
              AND ccu.table_name = 'workflow'
          LOOP
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', $1, constraint_rec.table_name, constraint_rec.constraint_name);
          END LOOP;
        END $$;
      `,
        [schemaName]
      );

      // Drop workflow table
      await queryRunner.query(
        `DROP TABLE IF EXISTS $1."workflow" CASCADE`,
        [schemaName]
      );

      // Drop enum types if they exist
      await queryRunner.query(
        `DROP TYPE IF EXISTS $1."workflow_statuses_enum" CASCADE`,
        [schemaName]
      );

      await queryRunner.query(
        `DROP TYPE IF EXISTS $1."workflow_createdBySource_enum" CASCADE`,
        [schemaName]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore dropped tables
  }
}
