import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
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
  return getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  )
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
