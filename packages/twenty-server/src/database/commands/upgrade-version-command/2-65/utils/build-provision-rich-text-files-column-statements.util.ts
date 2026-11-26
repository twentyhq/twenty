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
  const columnClausesByTableName = new Map<string, string[]>();

  const addColumnClause = ({
    tableName,
    columnClause,
  }: {
    tableName: string;
    columnClause: string;
  }) =>
    columnClausesByTableName.set(tableName, [
      ...(columnClausesByTableName.get(tableName) ?? []),
      columnClause,
    ]);

  for (const { tableName, fieldName } of richTextFields) {
    addColumnClause({
      tableName,
      columnClause: `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(`${fieldName}${RICH_TEXT_FILES_COLUMN_NAME_SUFFIX}`)} jsonb`,
    });
  }

  for (const { tableName, columnName } of fileIdsColumns) {
    addColumnClause({
      tableName,
      columnClause: `DROP COLUMN IF EXISTS ${escapeIdentifier(columnName)}`,
    });
  }

  return [...columnClausesByTableName].map(
    ([tableName, columnClauses]) =>
      `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${columnClauses.join(', ')}`,
  );
};
