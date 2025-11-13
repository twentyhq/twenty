import { capitalize } from 'twenty-shared/utils';
import { compositeTypeDefinitions } from 'twenty-shared/types';

import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const getConflictingFields = (
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
): {
  baseField: string;
  fullPath: string;
  column: string;
}[] => {
  return Object.values(objectMetadataItemWithFieldMaps.fieldsById)
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
