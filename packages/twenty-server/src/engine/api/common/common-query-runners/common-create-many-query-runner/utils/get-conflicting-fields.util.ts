import { compositeTypeDefinitions, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type ConflictingFieldGroup,
  type ConflictingProperty,
} from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/types/conflicting-field-group.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const computeConflictingPropertiesForIndexField = ({
  flatFieldMetadata,
  subFieldName,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  subFieldName: string | null;
}): ConflictingProperty[] | undefined => {
  if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    if (flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE) {
      return undefined;
    }

    const joinColumn = computeMorphOrRelationFieldJoinColumnName({
      name: flatFieldMetadata.name,
    });

    return [{ fullPath: joinColumn, column: joinColumn }];
  }

  if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
    const compositeType = compositeTypeDefinitions.get(flatFieldMetadata.type);

    if (!isDefined(compositeType)) {
      return undefined;
    }

    if (isDefined(subFieldName)) {
      const property = compositeType.properties.find(
        (compositeProperty) => compositeProperty.name === subFieldName,
      );

      if (!isDefined(property)) {
        return undefined;
      }

      return [
        {
          fullPath: `${flatFieldMetadata.name}.${property.name}`,
          column: computeCompositeColumnName(
            { name: flatFieldMetadata.name, type: flatFieldMetadata.type },
            property,
          ),
        },
      ];
    }

    return compositeType.properties
      .filter((property) => property.isIncludedInUniqueConstraint)
      .map((property) => ({
        fullPath: `${flatFieldMetadata.name}.${property.name}`,
        column: computeCompositeColumnName(
          { name: flatFieldMetadata.name, type: flatFieldMetadata.type },
          property,
        ),
      }));
  }

  return [{ fullPath: flatFieldMetadata.name, column: flatFieldMetadata.name }];
};

const computeConflictingPropertiesForIndex = ({
  flatIndexFieldMetadatas,
  flatFieldMetadataMaps,
}: {
  flatIndexFieldMetadatas: FlatIndexFieldMetadata[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}):
  | { baseFields: string[]; conflictingProperties: ConflictingProperty[] }
  | undefined => {
  const orderedIndexFields = [...flatIndexFieldMetadatas].sort(
    (a, b) => a.order - b.order,
  );

  const baseFields: string[] = [];
  const conflictingProperties: ConflictingProperty[] = [];

  for (const indexField of orderedIndexFields) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: indexField.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      return undefined;
    }

    const propertiesForField = computeConflictingPropertiesForIndexField({
      flatFieldMetadata,
      subFieldName: indexField.subFieldName,
    });

    if (!isDefined(propertiesForField) || propertiesForField.length === 0) {
      return undefined;
    }

    if (!baseFields.includes(flatFieldMetadata.name)) {
      baseFields.push(flatFieldMetadata.name);
    }

    conflictingProperties.push(...propertiesForField);
  }

  return { baseFields, conflictingProperties };
};

export const getConflictingFields = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>,
): ConflictingFieldGroup[] => {
  const conflictingFieldGroups: ConflictingFieldGroup[] = [];

  const idField = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).find((field) => field.name === 'id');

  if (isDefined(idField)) {
    conflictingFieldGroups.push({
      baseFields: ['id'],
      conflictingProperties: [{ fullPath: 'id', column: 'id' }],
    });
  }

  const uniqueIndexes = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.indexMetadataIds,
    flatEntityMaps: flatIndexMaps,
  }).filter((flatIndexMetadata) => flatIndexMetadata.isUnique);

  for (const flatIndexMetadata of uniqueIndexes) {
    const indexConflictingFields = computeConflictingPropertiesForIndex({
      flatIndexFieldMetadatas: flatIndexMetadata.flatIndexFieldMetadatas,
      flatFieldMetadataMaps,
    });

    if (
      !isDefined(indexConflictingFields) ||
      indexConflictingFields.conflictingProperties.length === 0
    ) {
      continue;
    }

    conflictingFieldGroups.push({
      baseFields: indexConflictingFields.baseFields,
      conflictingProperties: indexConflictingFields.conflictingProperties,
    });
  }

  return conflictingFieldGroups;
};
