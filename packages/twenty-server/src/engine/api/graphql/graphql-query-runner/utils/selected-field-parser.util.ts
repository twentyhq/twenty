import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { compositeTypeDefintions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { capitalize } from 'src/utils/capitalize';

export const parseSelectedFields = (
  parentObjectMetadata: ObjectMetadataInterface,
  graphqlSelectedFields: Partial<Record<string, any>>,
  objectMetadataMap: Record<string, any>,
): { select: Record<string, any>; relations: Record<string, any> } => {
  const parentFields =
    objectMetadataMap[parentObjectMetadata.nameSingular]?.fields;

  if (!parentFields) {
    throw new Error(
      `Could not find object metadata for ${parentObjectMetadata.nameSingular}`,
    );
  }

  return parseSelectedFieldsRecursive(
    graphqlSelectedFields,
    objectMetadataMap,
    parentFields,
  );
};

const parseSelectedFieldsRecursive = (
  graphqlSelectedFields: Partial<Record<string, any>>,
  objectMetadataMap: Record<string, any>,
  fieldMetadataMap: Record<string, FieldMetadataInterface>,
): { select: Record<string, any>; relations: Record<string, any> } => {
  const result: {
    select: Record<string, any>;
    relations: Record<string, any>;
  } = {
    select: {},
    relations: {},
  };

  for (const [fieldKey, fieldValue] of Object.entries(graphqlSelectedFields)) {
    if (isConnectionField(fieldKey, fieldValue)) {
      const subResult = parseSelectedFieldsRecursive(
        fieldValue,
        objectMetadataMap,
        fieldMetadataMap,
      );

      Object.assign(result.select, subResult.select);
      Object.assign(result.relations, subResult.relations);
      continue;
    }

    const fieldMetadata = fieldMetadataMap[fieldKey];

    if (!fieldMetadata) continue;

    if (isRelationFieldMetadataType(fieldMetadata.type)) {
      handleRelationField(
        fieldMetadata,
        fieldKey,
        fieldValue,
        objectMetadataMap,
        result,
      );
    } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeResult = handleCompositeFieldForSelect(
        fieldMetadata,
        fieldValue,
      );

      Object.assign(result.select, compositeResult);
    } else {
      result.select[fieldKey] = true;
    }
  }

  return result;
};

const handleRelationField = (
  fieldMetadata: FieldMetadataInterface,
  fieldKey: string,
  fieldValue: any,
  objectMetadataMap: Record<string, any>,
  result: { select: Record<string, any>; relations: Record<string, any> },
) => {
  result.relations[fieldKey] = true;

  if (!fieldValue || typeof fieldValue !== 'object') {
    return;
  }

  const relationMetadata =
    fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

  if (!relationMetadata) {
    throw new Error(
      `Relation metadata not found for field ${fieldMetadata.name}`,
    );
  }

  const relationDirection = deduceRelationDirection(
    fieldMetadata,
    relationMetadata,
  );

  const referencedObjectMetadata =
    relationDirection == RelationDirection.TO
      ? objectMetadataMap[relationMetadata.fromObjectMetadataId]
      : objectMetadataMap[relationMetadata.toObjectMetadataId];

  if (!referencedObjectMetadata) {
    throw new Error(
      `Referenced object metadata not found for relation ${relationMetadata.id}`,
    );
  }

  const relationFields = referencedObjectMetadata.fields;

  const subResult = parseSelectedFieldsRecursive(
    fieldValue,
    objectMetadataMap,
    relationFields,
  );

  result.select[fieldKey] = subResult.select;
  result.relations[fieldKey] = subResult.relations;
};

const handleCompositeFieldForSelect = (
  fieldMetadata: FieldMetadataInterface,
  fieldValue: any,
): Record<string, any> => {
  const compositeType = compositeTypeDefintions.get(
    fieldMetadata.type as CompositeFieldMetadataType,
  );

  if (!compositeType) {
    throw new Error(
      `Composite type definition not found for type: ${fieldMetadata.type}`,
    );
  }

  return Object.keys(fieldValue)
    .filter((subFieldKey) => subFieldKey !== '__typename')
    .reduce((acc, subFieldKey) => {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new Error(
          `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
        );
      }

      const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

      acc[fullFieldName] = true;

      return acc;
    }, {});
};

const isConnectionField = (fieldKey: string, fieldValue: any): boolean =>
  ['edges', 'node'].includes(fieldKey) && typeof fieldValue === 'object';
