import { type RecordPermissionDatabase } from 'src/engine/core-modules/record-permission/types/record-permission-database.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const createRecordPermissionIndex = async ({
  database,
  schemaName,
  indexName,
  definition,
}: {
  database: RecordPermissionDatabase;
  schemaName: string;
  indexName: string;
  definition: string;
}): Promise<void> => {
  const [existing] = await database.query(
    `SELECT index.indisvalid AS valid FROM pg_index index JOIN pg_class relation ON relation.oid = index.indexrelid JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace WHERE namespace.nspname = $1 AND relation.relname = $2`,
    [schemaName, indexName],
  );
  if (existing?.valid === true) return;
  // PostgreSQL retains an invalid index after an interrupted concurrent build.
  if (existing?.valid === false) {
    await database.query(
      `DROP INDEX CONCURRENTLY ${escapeIdentifier(schemaName)}.${escapeIdentifier(indexName)}`,
    );
  }
  await database.query(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS ${escapeIdentifier(indexName)} ${definition}`,
  );
};
