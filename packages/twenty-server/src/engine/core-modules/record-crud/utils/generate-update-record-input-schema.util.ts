import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';

export const generateUpdateRecordInputSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
    restrictedFields,
  );

  const updateSchema = recordPropertiesSchema.partial().extend({
    id: z.string().uuid({
      message:
        'The unique identifier (UUID) of the record to update. This is required to identify which record should be modified.',
    }),
  });

  return z.object({
    loadingMessage: z
      .string()
      .optional()
      .describe(
        'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
      ),
    input: updateSchema,
  });
};
