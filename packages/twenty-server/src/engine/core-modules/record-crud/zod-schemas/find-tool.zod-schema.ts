import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { ObjectRecordOrderBySchema } from 'src/engine/core-modules/record-crud/zod-schemas/order-by.zod-schema';
import { generateRecordFilterSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-filter.zod-schema';

export const generateFindToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const { filterShape, filterSchema } = generateRecordFilterSchema(
    objectMetadata,
    restrictedFields,
  );

  return z.object({
    limit: z
      .number()
      .int()
      .positive()
      .max(100)
      .default(10)
      .describe(
        'Maximum number of records to return (default: 10, max: 100). Start small and increase only if needed.',
      ),
    offset: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe('Number of records to skip (default: 0)'),
    orderBy: ObjectRecordOrderBySchema.describe(
      'Sort records by field(s). CRITICAL for "top N", "largest", "smallest" queries. Each item is an object with exactly ONE property: field name as key, sort direction as value. Example: [{"employees": "DescNullsLast"}] sorts employees descending. Use "DescNullsLast" for top/largest, "AscNullsFirst" for bottom/smallest.',
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
  });
};
