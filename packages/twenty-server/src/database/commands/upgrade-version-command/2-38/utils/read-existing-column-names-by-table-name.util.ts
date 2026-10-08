import { IDENTIFIER_MAX_CHAR_LENGTH } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

// Filtering on relname lets Postgres use both columns of the pg_class name
// index; a schema-only filter scans it across every workspace schema.
export const readExistingColumnNamesByTableName = async ({
  dataSource,
  schemaName,
  tableNames,
}: {
  dataSource: DataSource;
  schemaName: string;
  tableNames: string[];
}): Promise<Map<string, Set<string>>> => {
  const rows = await dataSource.query<
    { tableName: string; columnName: string }[]
  >(
    `SELECT c.relname AS "tableName", a.attname AS "columnName"
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     JOIN pg_attribute a ON a.attrelid = c.oid
     WHERE n.nspname = $1
       AND c.relname = ANY($2)
       AND c.relkind IN ('r', 'p')
       AND a.attnum > 0
       AND NOT a.attisdropped`,
    [schemaName, tableNames],
  );

  const columnNamesByStoredTableName = new Map<string, Set<string>>();

  for (const { tableName, columnName } of rows) {
    const columnNames =
      columnNamesByStoredTableName.get(tableName) ?? new Set();

    columnNames.add(columnName);
    columnNamesByStoredTableName.set(tableName, columnNames);
  }

  // Postgres truncates identifiers to 63 bytes, so the table of a 63-character
  // custom object is stored under a shorter name than the one requested.
  return new Map(
    tableNames.flatMap((tableName) => {
      const columnNames = columnNamesByStoredTableName.get(
        tableName.slice(0, IDENTIFIER_MAX_CHAR_LENGTH),
      );

      return isDefined(columnNames) ? [[tableName, columnNames] as const] : [];
    }),
  );
};
