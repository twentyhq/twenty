import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordCountQuery = ({
  schemaName,
  tableNames,
}: {
  schemaName: string;
  tableNames: string[];
}): string => {
  if (tableNames.length === 0) {
    return 'SELECT 0::bigint AS quantity';
  }

  const countByTable = tableNames
    .map(
      (tableName) =>
        `SELECT COUNT(*) AS quantity FROM ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)}`,
    )
    .join(' UNION ALL ');

  return `SELECT SUM(quantity)::bigint AS quantity FROM (${countByTable}) AS record_counts`;
};
