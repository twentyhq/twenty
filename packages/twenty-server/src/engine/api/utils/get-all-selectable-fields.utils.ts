import { RestrictedFields } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

export const getAllSelectableFields = ({
  restrictedFields,
  objectMetadata,
}: {
  restrictedFields: RestrictedFields;
  objectMetadata: { objectMetadataMapItem: ObjectMetadataItemWithFieldMaps };
}) => {
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
