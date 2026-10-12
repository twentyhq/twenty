import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildDuplicateSourceColumnsToSelect = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  restrictedFields,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  restrictedFields: RestrictedFieldsPermissions;
}): Record<string, boolean> => {
  const duplicateColumnNames = new Set([
    'id',
    ...(flatObjectMetadata.duplicateCriteria ?? []).flat(),
  ]);
  const selectableColumns = getAllSelectableColumnNames({
    restrictedFields,
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
