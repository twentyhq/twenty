import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { z } from 'zod';

import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { ObjectRecordOrderBySchema } from 'src/engine/core-modules/record-crud/zod-schemas/order-by.zod-schema';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const generateFindToolInputSchema = (
  objectMetadata: ObjectMetadataEntity,
  restrictedFields?: RestrictedFieldsPermissions,
) => {
  const filterShape: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (shouldExcludeFieldFromAgentToolSchema(field)) {
      return;
    }

    if (restrictedFields?.[field.id]?.canRead === false) {
      return;
    }

    const filterSchema = generateFieldFilterZodSchema(field);

    if (!filterSchema) {
      return;
    }

    const isManyToOneRelationField =
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings?.relationType === RelationType.MANY_TO_ONE;

    filterShape[isManyToOneRelationField ? `${field.name}Id` : field.name] =
      filterSchema;
  });

  return z.object({
    loadingMessage: z
      .string()
      .optional()
      .describe(
        'A clear, human-readable description of the action being performed. Explain what operation you are executing and with what parameters in natural language.',
      ),
    input: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .max(1000)
        .default(100)
        .describe('Maximum number of records to return (default: 100)'),
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
    }),
  });
};
