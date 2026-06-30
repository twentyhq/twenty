import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildInsertPrefix = (
  schemaName: string,
  tableName: string,
  columnNames: string[],
): string => {
  const escapedColumnNames = columnNames.map(escapeIdentifier).join(', ');

  return `INSERT INTO ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} (${escapedColumnNames}) VALUES `;
};
