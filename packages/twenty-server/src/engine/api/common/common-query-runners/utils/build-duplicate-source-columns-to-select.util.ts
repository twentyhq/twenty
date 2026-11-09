import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildDuplicateSourceColumnsToSelect = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  unreadableFieldMetadataIds,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  unreadableFieldMetadataIds: Set<string>;
}): Record<string, boolean> => {
  const duplicateColumnNames = new Set([
    'id',
    ...(flatObjectMetadata.duplicateCriteria ?? []).flat(),
  ]);
  const selectableColumns = getAllSelectableColumnNames({
    unreadableFieldMetadataIds,
    objectMetadata: {
      objectMetadataMapItem: flatObjectMetadata,
      flatFieldMetadataMaps,
    },
  });

  return Object.fromEntries(
    Object.entries(selectableColumns).filter(
      ([columnName, canRead]) =>
        canRead && duplicateColumnNames.has(columnName),
    ),
  );
};
