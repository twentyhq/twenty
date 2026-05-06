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

// Builds the per-field filter shape and full filter schema for a given object
// metadata, reusable across find and updateMany tools.
//
// The filter schema is bounded to 2 levels of logical nesting (or/and/not
// containing or/and/not) rather than using z.lazy(). z.lazy() produces
// $defs/$ref in the JSON Schema output which Google Gemini rejects — fully
// inlined schemas are required by that provider.
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

  // Leaf schema: only field-level predicates, no nested logical operators
  const leafFilterSchema = z.object({ ...filterShape }).partial();

  // One level of logical nesting wrapping leaf filters
  const innerFilterSchema: z.ZodTypeAny = z
    .object({
      ...filterShape,
      or: z
        .array(leafFilterSchema)
        .optional()
        .describe('OR condition - matches if ANY of the filters match'),
      and: z
        .array(leafFilterSchema)
        .optional()
        .describe('AND condition - matches if ALL filters match'),
      not: leafFilterSchema
        .optional()
        .describe('NOT condition - matches if the filter does NOT match'),
    })
    .partial();

  // Outer schema: two levels of logical nesting
  const filterSchema: z.ZodTypeAny = z
    .object({
      ...filterShape,
      or: z
        .array(innerFilterSchema)
        .optional()
        .describe('OR condition - matches if ANY of the filters match'),
      and: z
        .array(innerFilterSchema)
        .optional()
        .describe('AND condition - matches if ALL filters match'),
      not: innerFilterSchema
        .optional()
        .describe('NOT condition - matches if the filter does NOT match'),
    })
    .partial();

  return { filterShape, filterSchema };
};
