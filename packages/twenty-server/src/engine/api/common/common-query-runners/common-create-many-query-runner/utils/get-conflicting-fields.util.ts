import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getConflictingFields = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): ConflictingFieldGroup[] => {
  return getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  )
    .filter((field) => field.isUnique || field.name === 'id')
    .map((field) => {
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (!compositeType) {
        return {
          baseField: field.name,
          conflictingProperties: [{ fullPath: field.name, column: field.name }],
        };
      }

      const conflictingProperties = compositeType.properties
        .filter((prop) => prop.isIncludedInUniqueConstraint)
        .map((property) => ({
          fullPath: `${field.name}.${property.name}`,
          column: `${field.name}${capitalize(property.name)}`,
        }));

      return { baseField: field.name, conflictingProperties };
    })
    .filter((group) => group.conflictingProperties.length > 0);
};
