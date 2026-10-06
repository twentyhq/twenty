import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
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

  const storedTableNames = new Set(rows.map(({ tableName }) => tableName));

  // Postgres truncates identifiers to 63 bytes, so the table of a 63-character
  // custom object is stored under a shorter name than the one requested.
  return new Set(
    tableNames.filter((tableName) =>
      storedTableNames.has(tableName.slice(0, IDENTIFIER_MAX_CHAR_LENGTH)),
    ),
  );
};
