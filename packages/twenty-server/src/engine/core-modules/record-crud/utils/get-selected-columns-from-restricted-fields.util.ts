import isEmpty from 'lodash.isempty';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { getAllSelectableFields } from 'src/engine/api/utils/get-all-selectable-fields.utils';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getSelectedColumnsFromRestrictedFields = (
  restrictedFields: RestrictedFieldsPermissions | undefined,
  objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
): string[] | undefined => {
  if (!restrictedFields || isEmpty(restrictedFields)) {
    return undefined;
  }

  const selectableFields = getAllSelectableFields({
    restrictedFields,
    objectMetadata: {
      objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
    },
  });

  return Object.keys(selectableFields).filter((key) => selectableFields[key]);
};
