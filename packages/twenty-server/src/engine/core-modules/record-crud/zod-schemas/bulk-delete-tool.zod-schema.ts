import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordFilterSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-filter.zod-schema';

export const generateBulkDeleteToolInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const { filterSchema } = generateRecordFilterSchema({
    objectMetadata,
    restrictedFields,
  });

  return z.object({
    filter: filterSchema.describe(
      'Filter to select which records to delete. Supports field-level filters and logical operators (or, and, not). WARNING: A broad filter may delete many records at once. Always verify the filter scope with a find query first.',
    ),
  });
};

export type BulkDeleteToolInput = {
  filter: Record<string, unknown>;
};
