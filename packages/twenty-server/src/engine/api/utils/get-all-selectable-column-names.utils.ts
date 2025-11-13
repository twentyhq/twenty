import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

type GetAllSelectableFieldsArgs = {
  restrictedFields: RestrictedFieldsPermissions;
  objectMetadata: { objectMetadataMapItem: ObjectMetadataItemWithFieldMaps };
};

export const getAllSelectableColumnNames = ({
  restrictedFields,
  objectMetadata,
}: GetAllSelectableFieldsArgs) => {
  const restrictedFieldsIds = Object.entries(restrictedFields)
    .filter(([_, value]) => value.canRead === false)
    .map(([key]) => key);

  const fieldMetadataIdToColumnNamesMap = getFieldMetadataIdToColumnNamesMap(
    objectMetadata.objectMetadataMapItem,
  );

  const restrictedFieldsColumnNames: string[] = restrictedFieldsIds
    .map((fieldId) => fieldMetadataIdToColumnNamesMap.get(fieldId))
    .filter(isDefined)
    .flat();

  const allColumnNames = [...fieldMetadataIdToColumnNamesMap.values()].flat();

  const restrictedFieldsColumnNamesSet = new Set(restrictedFieldsColumnNames);

  return Object.fromEntries(
    allColumnNames.map((columnName) => [
      columnName,
      !restrictedFieldsColumnNamesSet.has(columnName),
    ]),
  );
};
