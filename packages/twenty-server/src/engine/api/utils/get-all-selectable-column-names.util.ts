import { isComputedField, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFieldMetadataIdToColumnNamesMap } from 'src/engine/twenty-orm/utils/get-field-metadata-id-to-column-names-map.util';

type GetAllSelectableFieldsArgs = {
  unreadableFieldMetadataIds: Set<string>;
  objectMetadata: {
    objectMetadataMapItem: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  };
};

export const getAllSelectableColumnNames = ({
  unreadableFieldMetadataIds,
  objectMetadata,
}: GetAllSelectableFieldsArgs) => {
  const fieldMetadataIdToColumnNamesMap = getFieldMetadataIdToColumnNamesMap(
    objectMetadata.objectMetadataMapItem,
    objectMetadata.flatFieldMetadataMaps,
  );

  const unreadableColumnNames: string[] = [...unreadableFieldMetadataIds]
    .map((fieldId) => fieldMetadataIdToColumnNamesMap.get(fieldId))
    .filter(isDefined)
    .flat();

  // Computed columns exist only in read queries, so a write cannot return them
  const allColumnNames = [...fieldMetadataIdToColumnNamesMap.entries()]
    .filter(
      ([fieldMetadataId]) =>
        !isComputedField(
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: fieldMetadataId,
            flatEntityMaps: objectMetadata.flatFieldMetadataMaps,
          }),
        ),
    )
    .flatMap(([, columnNames]) => columnNames);

  const unreadableColumnNamesSet = new Set(unreadableColumnNames);

  return Object.fromEntries(
    allColumnNames.map((columnName) => [
      columnName,
      !unreadableColumnNamesSet.has(columnName),
    ]),
  );
};
