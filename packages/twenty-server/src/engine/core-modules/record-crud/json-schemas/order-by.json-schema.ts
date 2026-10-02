import { type JSONSchema7 } from 'json-schema';
import {
  compositeTypeDefinitions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  isDefined,
  shouldExcludeFieldFromAgentToolSchema,
} from 'twenty-shared/utils';

import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { getManyToOneJoinColumnName } from 'src/engine/core-modules/record-crud/utils/get-many-to-one-join-column-name.util';
import { referenceJsonSchemaDefinition } from 'src/engine/core-modules/record-crud/utils/reference-json-schema-definition.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

const ORDER_BY_DIRECTION_JSON_SCHEMA: JSONSchema7 = {
  type: 'string',
  enum: ['AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast'],
};

// Mirrors the GraphQL orderBy input, so the shape advertised for each field
// (direction for scalars, sub-fields for composites) is the one the orderBy
// resolver accepts for this object
export const generateRecordOrderByJsonSchema = ({
  objectMetadata,
  restrictedFields,
  definitions,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
  definitions: JsonSchemaDefinitions;
}): JSONSchema7 => {
  const direction = referenceJsonSchemaDefinition({
    definitions,
    name: 'OrderByDirection',
    schema: ORDER_BY_DIRECTION_JSON_SCHEMA,
  });

  const orderByItemProperties: Record<string, JSONSchema7> = {};

  for (const field of objectMetadata.fields) {
    // System fields stay sortable: agents sort by createdAt, updatedAt and
    // position to get recent or first records
    if (
      shouldExcludeFieldFromAgentToolSchema({
        fieldName: field.name,
        isSystem: false,
        excludeId: false,
      }) ||
      restrictedFields?.[field.id]?.canRead === false
    ) {
      continue;
    }

    if (isMorphOrRelationFlatFieldMetadata(field)) {
      const joinColumnName = getManyToOneJoinColumnName(field);

      if (isDefined(joinColumnName)) {
        orderByItemProperties[joinColumnName] = direction;
      }

      continue;
    }

    if (!isCompositeFieldMetadataType(field.type)) {
      orderByItemProperties[field.name] = direction;

      continue;
    }

    const compositeType = compositeTypeDefinitions.get(field.type);

    if (!isDefined(compositeType)) {
      continue;
    }

    orderByItemProperties[field.name] = {
      type: 'object',
      properties: Object.fromEntries(
        compositeType.properties
          .filter((property) => property.hidden !== true)
          .map((property) => [property.name, direction]),
      ),
      additionalProperties: false,
    };
  }

  return {
    description:
      'Array of sort criteria, one field per item. Use "DescNullsLast" for descending (top/largest), "AscNullsFirst" for ascending (bottom/smallest).',
    type: 'array',
    items: {
      description:
        'Object with exactly ONE property. Scalar fields take a direction string; composite fields take an object with one sub-field. Never use dot-notation keys.',
      type: 'object',
      properties: orderByItemProperties,
      additionalProperties: false,
    },
  };
};
