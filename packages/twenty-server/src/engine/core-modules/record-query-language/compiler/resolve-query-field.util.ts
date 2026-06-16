import { FieldMetadataType } from 'twenty-shared/types';
import { shouldExcludeFieldFromAgentToolSchema } from 'twenty-shared/utils';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type QueryCompileError } from 'src/engine/core-modules/record-query-language/types/query-compile-result.type';
import { generateFieldFilterZodSchema } from 'src/engine/core-modules/record-crud/zod-schemas/field-filters.zod-schema';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export type ResolvedQueryField = {
  // Keys to nest the leaf under when building an ObjectRecordFilter / orderBy /
  // groupBy entry, e.g. ['name', 'firstName'] or ['companyId'].
  columnPath: string[];
  field: FlatFieldMetadata;
  // Operators the field's own filter schema accepts.
  allowedOperators: string[];
  // The innermost { op: value } schema, used to validate the comparison value.
  leafSchema: z.ZodObject<z.ZodRawShape>;
};

export type QueryFieldResolution =
  | { ok: true; resolved: ResolvedQueryField }
  | { ok: false; error: QueryCompileError };

export type QueryFieldResolver = {
  resolve: (fieldPath: string, astPath: string) => QueryFieldResolution;
  // Canonical filterable field names (FK column for relations), for select
  // validation and did-you-mean suggestions.
  fieldNames: string[];
};

export const buildNestedTree = (
  columnPath: string[],
  leaf: unknown,
): Record<string, unknown> =>
  columnPath.reduceRight<unknown>(
    (accumulator, key) => ({ [key]: accumulator }),
    leaf,
  ) as Record<string, unknown>;

const isManyToOneRelation = (field: FlatFieldMetadata): boolean =>
  (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
    isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION)) &&
  field.settings?.relationType === RelationType.MANY_TO_ONE;

const unwrapToObjectSchema = (
  schema: z.ZodType,
): z.ZodObject<z.ZodRawShape> | null => {
  const unwrapped = schema instanceof z.ZodOptional ? schema.unwrap() : schema;

  return unwrapped instanceof z.ZodObject
    ? (unwrapped as z.ZodObject<z.ZodRawShape>)
    : null;
};

// A field filter is "nested" (composite) when its shape values are themselves
// objects (subfield -> { op: value }) rather than operators directly. Derived
// structurally so it stays correct even where a composite type is filtered as a
// scalar (e.g. ACTOR via the default schema).
const isNestedSchema = (objectSchema: z.ZodObject<z.ZodRawShape>): boolean =>
  Object.values(objectSchema.shape).some(
    (value) => unwrapToObjectSchema(value as z.ZodType) !== null,
  );

const levenshtein = (a: string, b: string): number => {
  const distances = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    let previous = distances[0];

    distances[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const current = distances[j];

      distances[j] = Math.min(
        distances[j] + 1,
        distances[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }

  return distances[b.length];
};

const suggestClosest = (
  input: string,
  candidates: string[],
): string | undefined => {
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const distance = levenshtein(input.toLowerCase(), candidate.toLowerCase());

    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  const threshold = Math.max(2, Math.floor(input.length / 3));

  return best !== undefined && bestDistance <= threshold ? best : undefined;
};

export const createQueryFieldResolver = (
  objectMetadata: ObjectMetadataForToolSchema,
): QueryFieldResolver => {
  const filterableFields = objectMetadata.fields.filter(
    (field) =>
      !shouldExcludeFieldFromAgentToolSchema({
        fieldName: field.name,
        isSystem: field.isSystem,
        additionalExcludedFieldNames: [],
      }),
  );

  const fieldByName = new Map(
    filterableFields.map((field) => [field.name, field]),
  );

  const fieldNames: string[] = [];

  for (const field of filterableFields) {
    if (generateFieldFilterZodSchema(field) === null) {
      continue;
    }

    fieldNames.push(
      isManyToOneRelation(field) ? `${field.name}Id` : field.name,
    );
  }

  const resolve = (
    fieldPath: string,
    astPath: string,
  ): QueryFieldResolution => {
    const segments = fieldPath.split('.');

    if (segments.length > 2) {
      return {
        ok: false,
        error: {
          path: astPath,
          code: 'relation_path_too_deep',
          message: `"${fieldPath}" traverses more than one relation, which is not supported. Filter relations by their FK column instead (e.g. "companyId").`,
        },
      };
    }

    const [head, subField] = segments;

    let field = fieldByName.get(head);

    // Forgive the relation form ("company") by mapping it to its FK column.
    if (field === undefined && head.endsWith('Id')) {
      const relationField = fieldByName.get(head.slice(0, -2));

      if (relationField !== undefined && isManyToOneRelation(relationField)) {
        field = relationField;
      }
    }

    if (field === undefined) {
      return {
        ok: false,
        error: {
          path: astPath,
          code: 'unknown_field',
          message: `Unknown field "${head}" on ${objectMetadata.nameSingular}.`,
          suggestion: suggestClosest(head, fieldNames),
        },
      };
    }

    const fieldSchema = generateFieldFilterZodSchema(field);
    const objectSchema =
      fieldSchema !== null ? unwrapToObjectSchema(fieldSchema) : null;

    if (objectSchema === null) {
      return {
        ok: false,
        error: {
          path: astPath,
          code: 'field_not_filterable',
          message: `Field "${field.name}" cannot be filtered.`,
        },
      };
    }

    if (isManyToOneRelation(field)) {
      if (subField !== undefined) {
        return {
          ok: false,
          error: {
            path: astPath,
            code: 'relation_path_too_deep',
            message: `Cannot filter relation "${field.name}" by a related field. Filter by its FK column "${field.name}Id" instead.`,
          },
        };
      }

      return {
        ok: true,
        resolved: {
          columnPath: [`${field.name}Id`],
          field,
          allowedOperators: Object.keys(objectSchema.shape),
          leafSchema: objectSchema,
        },
      };
    }

    if (isNestedSchema(objectSchema)) {
      const subFieldNames = Object.keys(objectSchema.shape);

      if (subField === undefined) {
        return {
          ok: false,
          error: {
            path: astPath,
            code: 'composite_subfield_required',
            message: `Field "${field.name}" is composite — target a subfield (e.g. "${field.name}.${subFieldNames[0]}"). Available: ${subFieldNames.join(', ')}.`,
            suggestion: `${field.name}.${subFieldNames[0]}`,
          },
        };
      }

      const subFieldSchemaRaw = objectSchema.shape[subField] as
        | z.ZodType
        | undefined;
      const subFieldSchema =
        subFieldSchemaRaw !== undefined
          ? unwrapToObjectSchema(subFieldSchemaRaw)
          : null;

      if (subFieldSchema === null) {
        return {
          ok: false,
          error: {
            path: astPath,
            code: 'unknown_field',
            message: `Unknown subfield "${subField}" on composite field "${field.name}".`,
            suggestion: suggestClosest(subField, subFieldNames),
          },
        };
      }

      return {
        ok: true,
        resolved: {
          columnPath: [field.name, subField],
          field,
          allowedOperators: Object.keys(subFieldSchema.shape),
          leafSchema: subFieldSchema,
        },
      };
    }

    if (subField !== undefined) {
      return {
        ok: false,
        error: {
          path: astPath,
          code: 'unknown_field',
          message: `Field "${field.name}" is scalar and takes no subfield "${subField}".`,
        },
      };
    }

    return {
      ok: true,
      resolved: {
        columnPath: [field.name],
        field,
        allowedOperators: Object.keys(objectSchema.shape),
        leafSchema: objectSchema,
      },
    };
  };

  return { resolve, fieldNames };
};
