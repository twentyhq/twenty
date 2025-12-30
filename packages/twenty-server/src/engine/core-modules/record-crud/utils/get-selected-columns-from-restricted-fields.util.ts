import isEmpty from 'lodash.isempty';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getSelectedColumnsFromRestrictedFields = (
  restrictedFields: RestrictedFieldsPermissions | undefined,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): string[] | undefined => {
  if (!restrictedFields || isEmpty(restrictedFields)) {
    return undefined;
  }

  const selectableFields = getAllSelectableColumnNames({
    restrictedFields,
    objectMetadata: {
      objectMetadataMapItem: flatObjectMetadata,
      flatFieldMetadataMaps,
    },
  });

  return Object.keys(selectableFields).filter(
    (columnName) => selectableFields[columnName],
  );
};
