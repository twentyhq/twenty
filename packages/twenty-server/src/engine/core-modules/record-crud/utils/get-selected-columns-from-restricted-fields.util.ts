import isEmpty from 'lodash.isempty';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { getAllSelectableColumnNames } from 'src/engine/api/utils/get-all-selectable-column-names.utils';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getSelectedColumnsFromRestrictedFields = (
  restrictedFields: RestrictedFieldsPermissions | undefined,
  objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
): string[] | undefined => {
  if (!restrictedFields || isEmpty(restrictedFields)) {
    return undefined;
  }

  const selectableFields = getAllSelectableColumnNames({
    restrictedFields,
    objectMetadata: {
      objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
    },
  });

  return Object.keys(selectableFields);
};
