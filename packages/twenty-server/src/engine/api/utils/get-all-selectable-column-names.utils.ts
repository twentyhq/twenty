import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

type GetAllSelectableFieldsArgs = {
  restrictedFields: RestrictedFieldsPermissions;
  objectMetadata: {
    objectMetadataMapItem: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  };
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
    objectMetadata.flatFieldMetadataMaps,
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
