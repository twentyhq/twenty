import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';

export const generateUpdateManyRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  );

  const recordUpdateSchema = recordPropertiesSchema.partial().extend({
    id: z.string().uuid({
      message:
        'The unique identifier (UUID) of the record to update. This is required to identify which record should be modified.',
    }),
  });

  return z.object({
    records: z
      .array(recordUpdateSchema)
      .min(1)
      .max(20)
      .describe(
        'Array of record updates. Each entry must include an "id" field and the fields to update. Maximum 20 records per call.',
      ),
  });
};

