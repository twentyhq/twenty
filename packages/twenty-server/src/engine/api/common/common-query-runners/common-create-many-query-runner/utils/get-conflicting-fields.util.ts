import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { type ConflictingFieldGroup } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const getConflictingPropertiesFromField = (
  field: FlatFieldMetadata,
): ConflictingFieldGroup['conflictingProperties'] => {
  const compositeType = compositeTypeDefinitions.get(field.type);

  if (!compositeType) {
    return [{ fullPath: field.name, column: field.name }];
  }

  return compositeType.properties
    .filter((prop) => prop.isIncludedInUniqueConstraint)
    .map((property) => ({
      fullPath: `${field.name}.${property.name}`,
      column: `${field.name}${capitalize(property.name)}`,
    }));
};

export const getConflictingFields = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps?: FlatEntityMaps<FlatIndexMetadata>,
): ConflictingFieldGroup[] => {
  const flatFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  const flatFieldById = new Map(flatFields.map((field) => [field.id, field]));
  const singleFieldUniqueConflicts = flatFields
    .filter((field) => field.isUnique || field.name === 'id')
    .map((field) => ({
      baseField: field.name,
      conflictingProperties: getConflictingPropertiesFromField(field),
    }))
    .filter((group) => group.conflictingProperties.length > 0);

  if (!isDefined(flatIndexMaps)) {
    return singleFieldUniqueConflicts;
  }

  const indexBasedConflictingGroups = flatObjectMetadata.indexMetadataIds
    .map((indexMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: indexMetadataId,
        flatEntityMaps: flatIndexMaps,
      }),
    )
    .filter(isDefined)
    .filter((indexMetadata) => indexMetadata.isUnique)
    .map((indexMetadata) => {
      const conflictingProperties = indexMetadata.flatIndexFieldMetadatas
        .map((indexFieldMetadata) =>
          flatFieldById.get(indexFieldMetadata.fieldMetadataId),
        )
        .filter(isDefined)
        .flatMap((field) => getConflictingPropertiesFromField(field));

      if (conflictingProperties.length === 0) {
        return undefined;
      }

      return {
        baseField: conflictingProperties[0].fullPath,
        conflictingProperties,
      };
    })
    .filter(isDefined);

  if (indexBasedConflictingGroups.length === 0) {
    return singleFieldUniqueConflicts;
  }

  const allConflictingGroups = [
    ...singleFieldUniqueConflicts,
    ...indexBasedConflictingGroups,
  ];

  const seenGroupKeys = new Set<string>();

  return allConflictingGroups.filter((group) => {
    const groupKey = group.conflictingProperties
      .map((property) => property.column)
      .sort()
      .join('|');

    if (seenGroupKeys.has(groupKey)) {
      return false;
    }

    seenGroupKeys.add(groupKey);

    return true;
  });
};
