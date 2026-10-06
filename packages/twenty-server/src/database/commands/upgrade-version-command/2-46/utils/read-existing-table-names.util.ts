import { type DataSource } from 'typeorm';

// Filtering on relname lets Postgres use both columns of the pg_class name
// index; a schema-only filter scans it across every workspace schema.
export const readExistingTableNames = async ({
  dataSource,
  schemaName,
  tableNames,
}: {
  dataSource: DataSource;
  schemaName: string;
  tableNames: string[];
}): Promise<Set<string>> => {
  const rows = await dataSource.query<{ tableName: string }[]>(
    `SELECT c.relname AS "tableName"
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1
       AND c.relname = ANY($2)
       AND c.relkind IN ('r', 'p')`,
    [schemaName, tableNames],
  );

  return new Set(rows.map(({ tableName }) => tableName));
};
