import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const writeDataIsSupportedByOrmV2 = ({
  data,
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  data: Partial<ObjectRecord>;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  const { fieldIdByName, fieldIdByJoinColumnName } =
    buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

  return Object.keys(data).every((fieldName) => {
    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId:
        fieldIdByName[fieldName] ?? fieldIdByJoinColumnName[fieldName],
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(fieldMetadata)) {
      return false;
    }

    return fieldMetadata.type !== FieldMetadataType.FILES;
  });
};
