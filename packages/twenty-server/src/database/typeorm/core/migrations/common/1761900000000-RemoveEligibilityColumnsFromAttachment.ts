import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEligibilityColumnsFromAttachment1761900000000
  implements MigrationInterface
{
  name = 'RemoveEligibilityColumnsFromAttachment1761900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all workspace schemas
    const workspaceSchemas = await queryRunner.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'workspace_%'
    `);

    for (const { schema_name: schemaName } of workspaceSchemas) {
      // Remove eligibility columns from attachment table
      await this.removeEligibilityColumnsFromTable(
        queryRunner,
        schemaName,
        'attachment',
      );

      // Remove eligibility columns from timelineActivity table
      await this.removeEligibilityColumnsFromTable(
        queryRunner,
        schemaName,
        'timelineActivity',
      );
    }
  }

  private async removeEligibilityColumnsFromTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
  ): Promise<void> {
    const columns = [
      'eligibilityCallUserTaskId',
      'eligibilityManualUserTaskId',
    ];

    for (const columnName of columns) {
      // Check if column exists
      const columnExists = await queryRunner.query(
        `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
          AND column_name = $3
      `,
        [schemaName, tableName, columnName],
      );

      if (columnExists.length > 0) {
        // Drop foreign key constraint if exists
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
              AND tc.table_name = '${tableName}'
              AND kcu.column_name = '${columnName}';

            IF constraint_name IS NOT NULL THEN
              EXECUTE format('ALTER TABLE "${schemaName}"."${tableName}" DROP CONSTRAINT IF EXISTS %I CASCADE', constraint_name);
            END IF;
          END $$;
        `);

        // Drop the column
        await queryRunner.query(`
          ALTER TABLE "${schemaName}"."${tableName}"
          DROP COLUMN IF EXISTS "${columnName}" CASCADE
        `);
      }
    }
  }

  public async down(): Promise<void> {
    // This migration is not reversible as the columns were orphaned
    // and their original data/constraints are unknown
  }
}
