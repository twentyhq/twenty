import { RICH_TEXT_FILES_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-65/constants/rich-text-files-column-name-suffix.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildProvisionRichTextFilesColumnStatements = ({
  schemaName,
  richTextFields,
  fileIdsColumns,
}: {
  schemaName: string;
  richTextFields: { tableName: string; fieldName: string }[];
  fileIdsColumns: { tableName: string; columnName: string }[];
}): string[] => {
  const columnClauses = [
    ...richTextFields.map(({ tableName, fieldName }) => ({
      tableName,
      columnClause: `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(`${fieldName}${RICH_TEXT_FILES_COLUMN_NAME_SUFFIX}`)} jsonb`,
    })),
    ...fileIdsColumns.map(({ tableName, columnName }) => ({
      tableName,
      columnClause: `DROP COLUMN IF EXISTS ${escapeIdentifier(columnName)}`,
    })),
  ];
  const columnClausesByTableName = new Map<string, string[]>();

  for (const { tableName, columnClause } of columnClauses) {
    columnClausesByTableName.set(tableName, [
      ...(columnClausesByTableName.get(tableName) ?? []),
      columnClause,
    ]);
  }

  return [...columnClausesByTableName].map(
    ([tableName, tableColumnClauses]) =>
      `ALTER TABLE IF EXISTS ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${tableColumnClauses.join(', ')}`,
  );
};
