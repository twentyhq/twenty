import { type DataSource, type QueryRunner } from 'typeorm';

// An instance without billing never grew the billing tables, so a command
// touching one has to check first. Version-local rather than shared with the
// identical 2-38 util because upgrade command directories are append-only:
// widening that one to take a DataSource would edit a shipped version.
export const isCoreTablePresent = async (
  runner: QueryRunner | DataSource,
  tableName: string,
): Promise<boolean> => {
  const rows = await runner.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = $1`,
    [tableName],
  );

  return rows.length > 0;
};
