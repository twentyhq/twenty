import { type QueryRunner } from 'typeorm';

export type WorkspaceForeignKeyOnDeleteRule = {
  constraintName: string;
  onDeleteCode: string;
};

export const findWorkspaceForeignKeyOnDeleteRules = async ({
  queryRunner,
  schemaName,
  tableNames,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  tableNames: string[];
}): Promise<Map<string, WorkspaceForeignKeyOnDeleteRule>> => {
  if (tableNames.length === 0) {
    return new Map();
  }

  const rows: {
    table_name: string;
    column_name: string;
    constraint_name: string;
    on_delete_code: string;
  }[] = await queryRunner.query(
    `SELECT t.relname AS table_name,
            a.attname AS column_name,
            c.conname AS constraint_name,
            c.confdeltype AS on_delete_code
     FROM pg_namespace n
     JOIN pg_class t ON t.relnamespace = n.oid
     JOIN pg_constraint c ON c.conrelid = t.oid
     JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.conkey[1]
     WHERE n.nspname = $1
       AND t.relname = ANY ($2)
       AND c.contype = 'f'
       AND array_length(c.conkey, 1) = 1`,
    [schemaName, tableNames],
  );

  return new Map(
    rows.map((row) => [
      `${row.table_name}.${row.column_name}`,
      { constraintName: row.constraint_name, onDeleteCode: row.on_delete_code },
    ]),
  );
};
