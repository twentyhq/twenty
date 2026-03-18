import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';

const JSON_COLUMN_TYPES = new Set(['json', 'jsonb']);

type WorkspaceTableColumnSets = {
  jsonColumns: Set<string>;
  generatedColumns: Set<string>;
};

export const buildWorkspaceTableColumnSets = (
  workspaceId: string,
  objectMetadata: ObjectMetadataEntity,
  fieldMetadatas: FieldMetadataEntity[],
): WorkspaceTableColumnSets => {
  const jsonColumns = new Set<string>();
  const generatedColumns = new Set<string>();

  const flatObjectMetadata = objectMetadata as unknown as FlatObjectMetadata;

  for (const fieldMetadata of fieldMetadatas) {
    const flatFieldMetadata = fieldMetadata as unknown as FlatFieldMetadata;

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    });

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
