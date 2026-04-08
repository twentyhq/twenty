import {
  AggregateOperations,
  compositeTypeDefinitions,
  FirstDayOfTheWeek,
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

const getGroupableSubFields = (type: FieldMetadataType): string[] | null => {
  const compositeTypeDefinition = compositeTypeDefinitions.get(type);

  if (!compositeTypeDefinition) {
    return null;
  }

  return compositeTypeDefinition.properties
    .filter(
      (property) =>
        property.hidden !== true &&
        property.type !== FieldMetadataType.RAW_JSON,
    )
    .map((property) => property.name);
};

export const generateGroupByToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): z.ZodTypeAny | null => {
  const groupByEntries: z.ZodTypeAny[] = [];
  const fieldNameDescriptions: string[] = [];

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
      if (field.settings?.relationType === RelationType.MANY_TO_ONE) {
        groupByEntries.push(
          z
            .object({
              [`${field.name}Id`]: z.object({ id: z.literal(true) }).strict(),
            })
            .strict(),
        );
        fieldNameDescriptions.push(`${field.name}Id`);
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
      const subFields = getGroupableSubFields(field.type);

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

  if (groupByEntries.length === 0) {
    return null;
  }

  const groupByEntrySchema = z.union(
    groupByEntries as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
  );

  const { filterShape, filterSchema } = generateRecordFilterSchema(
    objectMetadata,
    restrictedFields,
  );

  return z
    .object({
      groupBy: z
        .array(groupByEntrySchema)
        .min(1)
        .max(2)
        .describe(
          `Fields to group by (max 2). Each entry must be an object with exactly one field key. Examples: {"status": true}, {"companyId": {"id": true}}, {"createdAt": {"granularity": "MONTH", "timeZone": "UTC"}}. Available: ${fieldNameDescriptions.join(', ')}.`,
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
