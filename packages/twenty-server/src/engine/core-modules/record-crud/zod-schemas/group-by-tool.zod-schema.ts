import {
  AggregateOperations,
  compositeTypeDefinitions,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordFilterSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-filter.zod-schema';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const getGroupableSubFieldsForCompositeType = (
  type: FieldMetadataType,
): string[] | null => {
  const compositeTypeDefinition = compositeTypeDefinitions.get(type);

  if (!compositeTypeDefinition) {
    return null;
  }

  return compositeTypeDefinition.properties
    .filter((property) => property.hidden !== true)
    .map((property) => property.name);
};

export const generateGroupByToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): z.ZodTypeAny | null => {
  const groupableFieldNames: string[] = [];

  for (const field of objectMetadata.fields) {
    if (restrictedFields?.[field.id]?.canRead === false) {
      continue;
    }

    const isGroupableDateField =
      isFieldMetadataDateKind(field.type) &&
      (field.name === 'createdAt' || field.name === 'updatedAt');

    if (!isGroupableDateField && shouldExcludeFieldFromAgentToolSchema(field)) {
      continue;
    }

    if (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION)) {
      // v1: expose FK-like grouping only for MANY_TO_ONE relations.
      if (field.settings?.relationType === RelationType.MANY_TO_ONE) {
        groupableFieldNames.push(`${field.name}Id`);
      }

      continue;
    }

    if (isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION)) {
      continue;
    }

    if (isFieldMetadataDateKind(field.type)) {
      groupableFieldNames.push(field.name);
      continue;
    }

    if (isCompositeFieldMetadataType(field.type)) {
      const subFields = getGroupableSubFieldsForCompositeType(field.type);

      if (subFields) {
        for (const subField of subFields) {
          groupableFieldNames.push(`${field.name}.${subField}`);
        }
      }

      continue;
    }

    groupableFieldNames.push(field.name);
  }

  if (groupableFieldNames.length === 0) {
    return null;
  }

  const groupByEnum = z.enum(groupableFieldNames as [string, ...string[]]);

  const { filterShape, filterSchema } = generateRecordFilterSchema(
    objectMetadata,
    restrictedFields,
  );

  const dateGranularityValues = Object.values(
    ObjectRecordGroupByDateGranularity,
  ).filter((v) => v !== ObjectRecordGroupByDateGranularity.NONE) as [
    string,
    ...string[],
  ];

  return z
    .object({
      groupBy: z
        .array(groupByEnum)
        .min(1)
        .max(2)
        .describe(
          `Fields to group by (max 2). Available: ${groupableFieldNames.join(', ')}. Use dot notation for composite fields (e.g. "name.firstName"). Date fields use a separate dateGranularity param.`,
        ),
      dateGranularity: z
        .enum(dateGranularityValues)
        .optional()
        .describe(
          'Granularity for date field grouping. Applies to whichever groupBy field is a date type. Default: MONTH. Cannot use if both groupBy fields are dates.',
        ),
      timeZone: z
        .string()
        .optional()
        .describe(
          'IANA timezone for date groupings (e.g. "America/New_York"). Default: UTC.',
        ),
      aggregateOperation: z
        .enum(Object.keys(AggregateOperations) as [string, ...string[]])
        .default(AggregateOperations.COUNT)
        .describe(
          'Aggregate operation to apply per group. Default: COUNT. SUM/AVG/MIN/MAX require aggregateFieldName.',
        ),
      aggregateFieldName: z
        .string()
        .optional()
        .describe(
          'Field to aggregate (required for SUM, AVG, MIN, MAX, and field-specific ops). Not needed for COUNT.',
        ),
      limit: z
        .number()
        .int()
        .positive()
        .max(100)
        .default(50)
        .describe(
          'Maximum number of groups to return (default: 50, max: 100).',
        ),
      orderBy: z
        .enum(['ASC', 'DESC'])
        .default('DESC')
        .describe(
          'Order groups by aggregate value. DESC (default) gives "top N" behavior.',
        ),
      ...filterShape,
      or: z
        .array(filterSchema)
        .optional()
        .describe('OR condition - matches if ANY of the filters match'),
      and: z
        .array(filterSchema)
        .optional()
        .describe('AND condition - matches if ALL filters match'),
      not: filterSchema
        .optional()
        .describe('NOT condition - matches if the filter does NOT match'),
    })
    .strict();
};
