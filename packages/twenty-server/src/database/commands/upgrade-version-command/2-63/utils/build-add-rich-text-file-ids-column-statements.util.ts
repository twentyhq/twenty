import { RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-63/constants/rich-text-file-ids-column-name-suffix.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildAddRichTextFileIdsColumnStatements = ({
  schemaName,
  richTextFields,
}: {
  schemaName: string;
  richTextFields: { tableName: string; fieldName: string }[];
}): string[] => {
  const fieldNamesByTableName = new Map<string, string[]>();

  for (const { tableName, fieldName } of richTextFields) {
    fieldNamesByTableName.set(tableName, [
      ...(fieldNamesByTableName.get(tableName) ?? []),
      fieldName,
    ]);
  }

  return [...fieldNamesByTableName].map(([tableName, fieldNames]) => {
    const addColumnClauses = fieldNames.map(
      (fieldName) =>
        `ADD COLUMN IF NOT EXISTS ${escapeIdentifier(`${fieldName}${RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX}`)} jsonb`,
    );

    return `ALTER TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} ${addColumnClauses.join(', ')}`;
  });
};
