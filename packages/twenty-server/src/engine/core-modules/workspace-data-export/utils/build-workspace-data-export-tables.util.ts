import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceDataExportColumn } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-column.type';
import { type WorkspaceDataExportTable } from 'src/engine/core-modules/workspace-data-export/types/workspace-data-export-table.type';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { WorkspaceDataExportException } from 'src/engine/core-modules/workspace-data-export/workspace-data-export.exception';

const buildColumns = ({
  workspaceId,
  flatObjectMetadata,
  flatFieldMetadatas,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadatas: FlatFieldMetadata[];
}): { columns: WorkspaceDataExportColumn[]; fieldCount: number } => {
  const columnsByName = new Map<string, WorkspaceDataExportColumn>();
  let fieldCount = 0;

  for (const flatFieldMetadata of flatFieldMetadatas) {
    const exportableColumnDefinitions = generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    }).filter(
      (columnDefinition) =>
        !isDefined(columnDefinition.generatedType) &&
        columnDefinition.type !== 'tsvector',
    );

    if (isNonEmptyArray(exportableColumnDefinitions)) {
      fieldCount++;
    }

    for (const columnDefinition of exportableColumnDefinitions) {
      columnsByName.set(columnDefinition.name, {
        name: columnDefinition.name,
        isText: columnDefinition.type === 'text',
      });
    }
  }

  const idColumn = columnsByName.get('id');

  if (!isDefined(idColumn)) {
    throw new WorkspaceDataExportException({
      message: `Object ${flatObjectMetadata.nameSingular} has no id column`,
      code: 'EXPORT_INCOMPLETE',
    });
  }

  columnsByName.delete('id');

  return { columns: [idColumn, ...columnsByName.values()], fieldCount };
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
      ...buildColumns({
        workspaceId,
        flatObjectMetadata,
        flatFieldMetadatas:
          fieldsByObjectUniversalIdentifier.get(
            flatObjectMetadata.universalIdentifier,
          ) ?? [],
      }),
    }));
};
