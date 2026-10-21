import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';

const buildColumns = ({
  workspaceId,
  flatObjectMetadata,
  flatFieldMetadatas,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadatas: FlatFieldMetadata[];
}): WorkspaceDataExportColumn[] => {
  const columnsByName = new Map<string, WorkspaceDataExportColumn>();

  for (const flatFieldMetadata of flatFieldMetadatas) {
    for (const columnDefinition of generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    })) {
      if (
        isDefined(columnDefinition.generatedType) ||
        columnDefinition.type === 'tsvector'
      ) {
        continue;
      }

      columnsByName.set(columnDefinition.name, {
        name: columnDefinition.name,
        isText: columnDefinition.type === 'text',
      });
    }
  }

  const idColumn = columnsByName.get('id');

  if (!isDefined(idColumn)) {
    return [];
  }

  columnsByName.delete('id');

  return [idColumn, ...columnsByName.values()];
};

export const buildWorkspaceDataExportTables = ({
  workspaceId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  workspaceId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  flatFieldMetadataMaps: FlatFieldMetadataMaps;
}): WorkspaceDataExportTable[] => {
  const fieldsByObjectUniversalIdentifier = new Map<
    string,
    FlatFieldMetadata[]
  >();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    const fields =
      fieldsByObjectUniversalIdentifier.get(
        flatFieldMetadata.objectMetadataUniversalIdentifier,
      ) ?? [];

    fields.push(flatFieldMetadata);
    fieldsByObjectUniversalIdentifier.set(
      flatFieldMetadata.objectMetadataUniversalIdentifier,
      fields,
    );
  }

  return Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((flatObjectMetadata) => flatObjectMetadata.isActive)
    .sort((left, right) => left.nameSingular.localeCompare(right.nameSingular))
    .map((flatObjectMetadata) => ({
      nameSingular: flatObjectMetadata.nameSingular,
      labelSingular: flatObjectMetadata.labelSingular,
      tableName: computeObjectTargetTable(flatObjectMetadata),
      columns: buildColumns({
        workspaceId,
        flatObjectMetadata,
        flatFieldMetadatas:
          fieldsByObjectUniversalIdentifier.get(
            flatObjectMetadata.universalIdentifier,
          ) ?? [],
      }),
    }))
    .filter((table) => isNonEmptyArray(table.columns));
};
