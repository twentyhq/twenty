import {
  AggregateOperations,
  FirstDayOfTheWeek,
  FieldMetadataType,
  ObjectRecordGroupByDateGranularity,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { z } from 'zod';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { resolveAggregateFieldKey } from 'src/engine/core-modules/record-crud/utils/resolve-aggregate-field-key.util';
import { generateRecordFilterSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-filter.zod-schema';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { isFlatFieldMetadataSupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-supported-in-group-by.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const dateGranularityValues = Object.values(
  ObjectRecordGroupByDateGranularity,
).filter((v) => v !== ObjectRecordGroupByDateGranularity.NONE) as [
  string,
  ...string[],
];

const dateGroupBySchema = z
  .object({
    granularity: z
      .enum(dateGranularityValues)
      .default(ObjectRecordGroupByDateGranularity.MONTH)
      .describe('Date grouping granularity. Default: MONTH.'),
    weekStartDay: z
      .nativeEnum(FirstDayOfTheWeek)
      .optional()
      .describe(
        'First day of week (MONDAY, SUNDAY, SATURDAY). Only used when granularity is WEEK.',
      ),
    timeZone: z
      .string()
      .default('UTC')
      .describe(
        'IANA timezone for date groupings (e.g. "America/New_York"). Default: UTC.',
      ),
  })
  .strict()
  .describe('Date field grouping configuration');

const buildGroupByEntriesAndDescriptions = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): {
  groupByEntries: z.ZodTypeAny[];
  fieldNameDescriptions: string[];
} => {
  const groupByEntries: z.ZodTypeAny[] = [];
  const fieldNameDescriptions: string[] = [];

  for (const field of objectMetadata.fields) {
    if (restrictedFields?.[field.id]?.canRead === false) {
      continue;
    }

    if (!isFlatFieldMetadataSupportedInGroupBy(field)) {
      continue;
    }

    if (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION)) {
      if (field.settings?.relationType === RelationType.MANY_TO_ONE) {
        const relationFieldName = `${field.name}Id`;

        groupByEntries.push(
          z.object({ [relationFieldName]: z.literal(true) }).strict(),
        );
        fieldNameDescriptions.push(relationFieldName);
      }

      continue;
    }

    if (isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION)) {
      continue;
    }

    if (isFieldMetadataDateKind(field.type)) {
      groupByEntries.push(
        z.object({ [field.name]: dateGroupBySchema }).strict(),
      );
      fieldNameDescriptions.push(`${field.name} (date)`);
      continue;
    }

    if (isCompositeFieldMetadataType(field.type)) {
      const subFields = getGroupableSubFieldsForCompositeType(field.type);

      if (subFields) {
        for (const subField of subFields) {
          groupByEntries.push(
            z
              .object({
                [field.name]: z
                  .object({ [subField]: z.literal(true) })
                  .strict(),
              })
              .strict(),
          );
          fieldNameDescriptions.push(`${field.name}.${subField}`);
        }
      }

      continue;
    }

    groupByEntries.push(z.object({ [field.name]: z.literal(true) }).strict());
    fieldNameDescriptions.push(field.name);
  }

  return { groupByEntries, fieldNameDescriptions };
};

export const hasGroupByToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): boolean => {
  return (
    buildGroupByEntriesAndDescriptions(objectMetadata, restrictedFields)
      .groupByEntries.length > 0
  );
};

export const generateGroupByToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): z.ZodTypeAny | null => {
  const { groupByEntries, fieldNameDescriptions } =
    buildGroupByEntriesAndDescriptions(objectMetadata, restrictedFields);

  if (groupByEntries.length === 0) {
    return null;
  }

  const groupByEntrySchema =
    groupByEntries.length === 1
      ? groupByEntries[0]
      : z.union(
          groupByEntries as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
        );

  const { filterShape, filterSchema } = generateRecordFilterSchema(
    objectMetadata,
    restrictedFields,
  );

  const availableAggregations = getAvailableAggregationsFromObjectFields(
    objectMetadata.fields.filter(
      (field) => restrictedFields?.[field.id]?.canRead !== false,
    ),
  );
  const availableAggregateFieldNames = Array.from(
    new Set(
      Object.values(availableAggregations)
        .filter(
          (aggregation) =>
            aggregation.aggregateOperation !== AggregateOperations.COUNT,
        )
        .map((aggregation) =>
          aggregation.subFieldForNumericOperation
            ? `${aggregation.fromField}.${aggregation.subFieldForNumericOperation}`
            : aggregation.fromField,
        ),
    ),
  );

  return z
    .object({
      groupBy: z
        .array(groupByEntrySchema)
        .min(1)
        .max(2)
        .describe(
          `Fields to group by (max 2). Each entry must be an object with exactly one field key. Examples: {"status": true}, {"companyId": true}, {"createdAt": {"granularity": "MONTH", "timeZone": "UTC"}}. Available: ${fieldNameDescriptions.join(', ')}.`,
        ),
      aggregateOperation: z
        .enum(Object.keys(AggregateOperations) as [string, ...string[]])
        .default(AggregateOperations.COUNT)
        .describe(
          'Aggregate operation to apply per group. Default: COUNT. Any operation other than COUNT requires aggregateFieldName.',
        ),
      aggregateFieldName: z
        .string()
        .optional()
        .describe(
          `Field to aggregate. Required for any operation other than COUNT. Available fields: ${availableAggregateFieldNames.join(', ')}.`,
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
    .strict()
    .superRefine((input, context) => {
      const aggregateOperation =
        input.aggregateOperation as keyof typeof AggregateOperations;

      if (aggregateOperation === AggregateOperations.COUNT) {
        if (input.aggregateFieldName) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'aggregateFieldName is not supported for COUNT operation.',
            path: ['aggregateFieldName'],
          });
        }

        return;
      }

      if (!input.aggregateFieldName) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `aggregateFieldName is required for ${aggregateOperation} operation.`,
          path: ['aggregateFieldName'],
        });

        return;
      }

      const resolvedAggregateFieldKey = resolveAggregateFieldKey(
        aggregateOperation,
        input.aggregateFieldName,
        availableAggregations,
      );

      if (!resolvedAggregateFieldKey) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `No aggregation available for ${aggregateOperation} on field "${input.aggregateFieldName}".`,
          path: ['aggregateFieldName'],
        });
      }
    });
};
