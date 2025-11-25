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
        'eligibilityCallUserTaskId',
      );
      await this.removeEligibilityColumnsFromTable(
        queryRunner,
        schemaName,
        'attachment',
        'eligibilityManualUserTaskId',
      );

      // Remove eligibility columns from timelineActivity table
      await this.removeEligibilityColumnsFromTable(
        queryRunner,
        schemaName,
        'timelineActivity',
        'eligibilityCallUserTaskId',
      );
      await this.removeEligibilityColumnsFromTable(
        queryRunner,
        schemaName,
        'timelineActivity',
        'eligibilityManualUserTaskId',
      );
    }
  }

  private async removeEligibilityColumnsFromTable(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    columnName: string,
  ): Promise<void> {
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
      await queryRunner.query(
        `
        DO $$
        DECLARE
          constraint_name text;
        BEGIN
          SELECT tc.constraint_name INTO constraint_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = $1
            AND tc.table_name = $2
            AND kcu.column_name = $3;

          IF constraint_name IS NOT NULL THEN
            EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT IF EXISTS %I CASCADE', $1, $2, constraint_name);
          END IF;
        END $$;
      `,
        [schemaName, tableName, columnName],
      );

      // Drop the column
      await queryRunner.query(
        `ALTER TABLE "${schemaName}"."${tableName}" DROP COLUMN IF EXISTS "${columnName}"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore dropped columns and constraints
  }
}
