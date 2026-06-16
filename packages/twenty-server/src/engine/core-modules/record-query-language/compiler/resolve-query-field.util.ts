import { FieldMetadataType } from 'twenty-shared/types';
import { shouldExcludeFieldFromAgentToolSchema } from 'twenty-shared/utils';
import { getEditDistance } from 'twenty-shared/workflow';
import { z } from 'zod';

import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import {
  type QueryCompileError,
  type QueryCompileErrorCode,
} from 'src/engine/core-modules/record-query-language/types/query-compile-result.type';
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
  // Closest filterable field name to the input, for did-you-mean errors.
  suggest: (input: string) => string | undefined;
  // Canonical filterable field names (FK column for relations), used to
  // validate select entries at field granularity.
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

const suggestClosest = (
  input: string,
  candidates: string[],
): string | undefined => {
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const distance = getEditDistance(
      input.toLowerCase(),
      candidate.toLowerCase(),
    );

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

  // Compile each field's filter schema once. resolve() reuses these instead of
  // recomputing generateFieldFilterZodSchema per lookup (SELECT/MULTI_SELECT
  // allocate a fresh enum schema on every call).
  const objectSchemaByName = new Map<string, z.ZodObject<z.ZodRawShape>>();
  const fieldNames: string[] = [];

  for (const field of filterableFields) {
    const fieldSchema = generateFieldFilterZodSchema(field);
    const objectSchema =
      fieldSchema !== null ? unwrapToObjectSchema(fieldSchema) : null;

    if (objectSchema === null) {
      continue;
    }

    objectSchemaByName.set(field.name, objectSchema);
    fieldNames.push(
      isManyToOneRelation(field) ? `${field.name}Id` : field.name,
    );
  }

  const suggest = (input: string): string | undefined =>
    suggestClosest(input, fieldNames);

  const resolve = (
    fieldPath: string,
    astPath: string,
  ): QueryFieldResolution => {
    const fail = (
      code: QueryCompileErrorCode,
      message: string,
      suggestion?: string,
    ): QueryFieldResolution => ({
      ok: false,
      error: {
        path: astPath,
        code,
        message,
        ...(suggestion !== undefined ? { suggestion } : {}),
      },
    });

    const segments = fieldPath.split('.');

    if (segments.length > 2) {
      return fail(
        'relation_path_too_deep',
        `"${fieldPath}" traverses more than one relation, which is not supported. Filter relations by their FK column instead (e.g. "companyId").`,
      );
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
      return fail(
        'unknown_field',
        `Unknown field "${head}" on ${objectMetadata.nameSingular}.`,
        suggestClosest(head, fieldNames),
      );
    }

    const objectSchema = objectSchemaByName.get(field.name);

    if (objectSchema === undefined) {
      return fail(
        'field_not_filterable',
        `Field "${field.name}" cannot be filtered.`,
      );
    }

    if (isManyToOneRelation(field)) {
      if (subField !== undefined) {
        return fail(
          'relation_path_too_deep',
          `Cannot filter relation "${field.name}" by a related field. Filter by its FK column "${field.name}Id" instead.`,
        );
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
        return fail(
          'composite_subfield_required',
          `Field "${field.name}" is composite — target a subfield (e.g. "${field.name}.${subFieldNames[0]}"). Available: ${subFieldNames.join(', ')}.`,
          `${field.name}.${subFieldNames[0]}`,
        );
      }

      const subFieldSchemaRaw = objectSchema.shape[subField] as
        | z.ZodType
        | undefined;
      const subFieldSchema =
        subFieldSchemaRaw !== undefined
          ? unwrapToObjectSchema(subFieldSchemaRaw)
          : null;

      if (subFieldSchema === null) {
        return fail(
          'unknown_field',
          `Unknown subfield "${subField}" on composite field "${field.name}".`,
          suggestClosest(subField, subFieldNames),
        );
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
      return fail(
        'unknown_field',
        `Field "${field.name}" is scalar and takes no subfield "${subField}".`,
      );
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

  return { resolve, suggest, fieldNames };
};
