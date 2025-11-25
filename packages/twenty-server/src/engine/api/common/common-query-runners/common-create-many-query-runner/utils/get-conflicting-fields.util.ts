import { capitalize, isDefined } from 'twenty-shared/utils';
import { compositeTypeDefinitions } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getConflictingFields = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): {
  baseField: string;
  fullPath: string;
  column: string;
}[] => {
  return flatObjectMetadata.fieldMetadataIds
    .map((fieldId) => flatFieldMetadataMaps.byId[fieldId])
    .filter(isDefined)
    .filter((field) => field.isUnique || field.name === 'id')
    .flatMap((field) => {
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (!compositeType) {
        return [
          {
            baseField: field.name,
            fullPath: field.name,
            column: field.name,
          },
        ];
      }

      const property = compositeType.properties.find(
        (prop) => prop.isIncludedInUniqueConstraint,
      );

      return property
        ? [
            {
              baseField: field.name,
              fullPath: `${field.name}.${property.name}`,
              column: `${field.name}${capitalize(property.name)}`,
            },
          ]
        : [];
    });
};
