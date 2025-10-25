import { z } from 'zod';

import { generateRecordPropertiesZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/record-properties.zod-schema';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const generateRecordInputSchema = (
  objectMetadata: ObjectMetadataEntity,
  includeId = false,
) => {
  const recordPropertiesSchema = generateRecordPropertiesZodSchema(
    objectMetadata,
    false,
  );

  const inputSchema = includeId
    ? recordPropertiesSchema.partial().extend({
        id: z.string().uuid({
          message:
            'The unique identifier (UUID) of the record to update. This is required to identify which record should be modified.',
        }),
      })
    : recordPropertiesSchema;

  return z.object({
    loadingMessage: z
      .string()
      .optional()
      .describe(
        'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
      ),
    input: inputSchema,
  });
};
