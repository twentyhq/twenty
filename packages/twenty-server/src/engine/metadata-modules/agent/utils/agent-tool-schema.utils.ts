import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const generateAgentToolZodSchema = (
  objectMetadata: ObjectMetadataEntity,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (
      field.name === 'id' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        schemaFields[fieldName] = z
          .string()
          .uuid()
          .nullable()
          .describe(field.description || `ID of the related ${field.name}`);
      }

      return;
    }

    const zodField = convertFieldToZodField(field);

    if (zodField) {
      schemaFields[field.name] = zodField;
    }
  });

  return z.object(schemaFields);
};

export const generateAgentToolUpdateZodSchema = (
  objectMetadata: ObjectMetadataEntity,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    id: z.string().uuid().describe('The ID of the record to update'),
  };

  objectMetadata.fields.forEach((field) => {
    if (
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (field.type === FieldMetadataType.RELATION) {
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        schemaFields[fieldName] = z
          .string()
          .uuid()
          .nullable()
          .optional()
          .describe(field.description || `ID of the related ${field.name}`);
      }

      return;
    }

    const zodField = convertFieldToZodField(field, true);

    if (zodField) {
      schemaFields[field.name] = zodField;
    }
  });

  return z.object(schemaFields);
};

const convertFieldToZodField = (
  field: FieldMetadataEntity,
  isForUpdate = false,
): z.ZodTypeAny | null => {
  const createBaseField = (
    zodType: z.ZodTypeAny,
    description: string,
  ): z.ZodTypeAny => {
    let result = zodType.describe(field.description || description);

    if (field.isNullable) {
      result = result.nullable();
    }

    if (isForUpdate) {
      result = result.optional();
    }

    return result;
  };

  switch (field.type) {
    case FieldMetadataType.UUID:
      return createBaseField(z.string().uuid(), 'UUID field');

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
      return createBaseField(z.string(), 'Text field');

    case FieldMetadataType.DATE_TIME:
      return createBaseField(z.string().datetime(), 'Date and time field');

    case FieldMetadataType.DATE:
      return createBaseField(z.string(), 'Date field (YYYY-MM-DD format)');

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return createBaseField(z.number(), 'Number field');

    case FieldMetadataType.BOOLEAN:
      return createBaseField(z.boolean(), 'Boolean field');

    case FieldMetadataType.SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return createBaseField(
        z.enum(enumValues as [string, ...string[]]),
        'Selection field',
      );
    }

    case FieldMetadataType.MULTI_SELECT: {
      const multiEnumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      return createBaseField(
        z.array(z.enum(multiEnumValues as [string, ...string[]])),
        'Multi-selection field',
      );
    }

    case FieldMetadataType.ARRAY:
      return createBaseField(z.array(z.string()), 'Array of strings');

    case FieldMetadataType.LINKS:
      return createBaseField(z.string(), 'Links field (JSON string format)');

    case FieldMetadataType.CURRENCY:
      return createBaseField(z.string(), 'Currency field');

    case FieldMetadataType.FULL_NAME:
      return createBaseField(z.string(), 'Full name field');

    case FieldMetadataType.ADDRESS:
      return createBaseField(z.string(), 'Address field (JSON string format)');

    case FieldMetadataType.EMAILS:
      return createBaseField(z.string(), 'Emails field (JSON string format)');

    case FieldMetadataType.PHONES:
      return createBaseField(z.string(), 'Phones field (JSON string format)');

    case FieldMetadataType.RAW_JSON:
      return createBaseField(z.string(), 'Raw JSON field');

    default:
      return createBaseField(z.string(), 'String field');
  }
};

export const generateFindToolSchema = (
  objectMetadata: ObjectMetadataEntity,
) => {
  const schemaFields: Record<string, z.ZodTypeAny> = {
    limit: z
      .number()
      .optional()
      .describe('Maximum number of records to return (default: 10)')
      .default(10),
    offset: z
      .number()
      .optional()
      .describe('Number of records to skip (default: 0)')
      .default(0),
  };

  objectMetadata.fields.forEach((field: FieldMetadataEntity) => {
    if (
      field.name === 'id' ||
      field.name === 'createdAt' ||
      field.name === 'updatedAt' ||
      field.name === 'deletedAt' ||
      field.name === 'searchVector' ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (
      field.type === FieldMetadataType.TEXT ||
      field.type === FieldMetadataType.RICH_TEXT ||
      field.type === FieldMetadataType.FULL_NAME
    ) {
      schemaFields[field.name] = z
        .string()
        .optional()
        .describe(`Search by ${field.name}`);
    }
  });

  return z.object(schemaFields);
};
