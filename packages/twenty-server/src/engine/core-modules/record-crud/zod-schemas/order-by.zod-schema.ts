import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  isDefined,
  shouldExcludeFieldFromAgentToolSchema,
} from 'twenty-shared/utils';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const OrderByDirectionEnum = z.enum([
  'AscNullsFirst',
  'AscNullsLast',
  'DescNullsFirst',
  'DescNullsLast',
]);

// Mirrors the GraphQL orderBy input, so the shape advertised for each field
// (direction for scalars, sub-fields for composites) is the one the orderBy
// resolver accepts for this object
export const generateRecordOrderBySchema = ({
  objectMetadata,
  restrictedFields,
}: {
  objectMetadata: ObjectMetadataForToolSchema;
  restrictedFields?: RestrictedFieldsPermissions;
}): z.ZodTypeAny => {
  const orderByItemShape: Record<string, z.ZodTypeAny> = {};

  for (const field of objectMetadata.fields) {
    // System fields stay sortable: agents sort by createdAt, updatedAt and
    // position to get recent or first records
    if (
      shouldExcludeFieldFromAgentToolSchema({
        fieldName: field.name,
        isSystem: false,
        excludeId: false,
      })
    ) {
      continue;
    }

    if (restrictedFields?.[field.id]?.canRead === false) {
      continue;
    }

    const isRelationField =
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
      isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION);

    if (isRelationField) {
      if (field.settings?.relationType === RelationType.MANY_TO_ONE) {
        orderByItemShape[`${field.name}Id`] = OrderByDirectionEnum.optional();
      }

      continue;
    }

    if (isCompositeFieldMetadataType(field.type)) {
      const compositeType = compositeTypeDefinitions.get(field.type);

      if (!isDefined(compositeType)) {
        continue;
      }

      const subFieldShape = Object.fromEntries(
        compositeType.properties
          .filter((property) => property.hidden !== true)
          .map((property) => [property.name, OrderByDirectionEnum.optional()]),
      );

      orderByItemShape[field.name] = z
        .object(subFieldShape)
        .strict()
        .optional();

      continue;
    }

    orderByItemShape[field.name] = OrderByDirectionEnum.optional();
  }

  const orderByItemSchema = z
    .object(orderByItemShape)
    .strict()
    .refine((item) => Object.keys(item).length === 1, {
      message: 'Each orderBy item must specify exactly one field',
    })
    .describe(
      'Object with exactly ONE property. Scalar fields take a direction string; composite fields take an object with one sub-field. Never use dot-notation keys.',
    );

  return z
    .array(orderByItemSchema)
    .optional()
    .describe(
      'Array of sort criteria, one field per item. Use "DescNullsLast" for descending (top/largest), "AscNullsFirst" for ascending (bottom/smallest).',
    );
};
