import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordFilterSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-filter.zod-schema';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';

export const generateUpdateManyRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const { filterSchema } = generateRecordFilterSchema(
    objectMetadata,
    restrictedFields,
  );

  const dataSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  ).partial();

  return z.object({
    filter: filterSchema.describe(
      'Filter to select which records to update. Supports field-level filters and logical operators (or, and, not). WARNING: A broad filter may update many records at once. Always verify the filter scope with a find query first.',
    ),
    data: dataSchema.describe(
      'The field values to apply to all matching records. Only include fields you want to change.',
    ),
  });
};
