import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

// Builds the per-field filter shape and full recursive filter schema
// for a given object metadata, reusable across find and updateMany tools
export const generateRecordFilterSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  restrictedFields?: RestrictedFieldsPermissions,
): {
  filterShape: Record<string, z.ZodTypeAny>;
  filterSchema: z.ZodTypeAny;
} => {
  const filterShape: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (shouldExcludeFieldFromAgentToolSchema(field)) {
      return;
    }

    if (restrictedFields?.[field.id]?.canRead === false) {
      return;
    }

    const fieldFilter = generateFieldFilterZodSchema(field);

    if (!fieldFilter) {
      return;
    }

    const isManyToOneRelationField =
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
      field.settings?.relationType === RelationType.MANY_TO_ONE;

    filterShape[isManyToOneRelationField ? `${field.name}Id` : field.name] =
      fieldFilter;
  });

  const filterSchema: z.ZodTypeAny = z.lazy(() =>
    z
      .object({
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
      .partial(),
  );

  return { filterShape, filterSchema };
};
