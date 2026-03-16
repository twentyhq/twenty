import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import { buildColumnDefinitionsForField } from 'src/database/commands/workspace-export/utils/build-column-definitions-for-field.util';

const JSON_COLUMN_TYPES = new Set(['json', 'jsonb']);

type WorkspaceTableColumnSets = {
  jsonColumns: Set<string>;
  generatedColumns: Set<string>;
};

export const buildWorkspaceTableColumnSets = (
  fieldMetadatas: FieldMetadataEntity[],
  schemaName: string,
  tableName: string,
): WorkspaceTableColumnSets => {
  const jsonColumns = new Set<string>();
  const generatedColumns = new Set<string>();

  for (const fieldMetadata of fieldMetadatas) {
    const columnDefinitions = buildColumnDefinitionsForField(
      fieldMetadata,
      schemaName,
      tableName,
    );

    for (const columnDefinition of columnDefinitions) {
      if (JSON_COLUMN_TYPES.has(columnDefinition.type)) {
        jsonColumns.add(columnDefinition.name);
      }

      if (columnDefinition.type === 'tsvector') {
        generatedColumns.add(columnDefinition.name);
      }
    }
  }

  return { jsonColumns, generatedColumns };
};
