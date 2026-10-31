import { type QueryRunner } from 'typeorm';

export type WorkspaceTableState = {
  sizeInBytes: number;
  existingColumnNames: Set<string>;
};

export const findWorkspaceTableStates = async ({
  queryRunner,
  schemaName,
  tableNames,
  columnNames,
}: {
  queryRunner: QueryRunner;
  schemaName: string;
  tableNames: string[];
  columnNames: string[];
}): Promise<Map<string, WorkspaceTableState>> => {
  const tables: {
    tableName: string;
    sizeInBytes: string;
    existingColumnNames: string[];
  }[] = await queryRunner.query(
    `SELECT c.relname AS "tableName",
            pg_relation_size(c.oid) AS "sizeInBytes",
            ARRAY(
              SELECT a.attname::text FROM pg_attribute a
              WHERE a.attrelid = c.oid AND a.attname = ANY($3) AND NOT a.attisdropped
            ) AS "existingColumnNames"
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = $1 AND c.relname = ANY($2) AND c.relkind IN ('r', 'p')`,
    [schemaName, tableNames, columnNames],
  );

  return new Map(
    tables.map(({ tableName, sizeInBytes, existingColumnNames }) => [
      tableName,
      {
        sizeInBytes: Number(sizeInBytes),
        existingColumnNames: new Set(existingColumnNames),
      },
    ]),
  );
};
