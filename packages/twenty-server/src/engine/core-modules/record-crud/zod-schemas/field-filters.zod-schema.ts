import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const NullCheckEnum = z.enum(['NULL', 'NOT_NULL']);

export const generateFieldFilterZodSchema = (
  field: FieldMetadataEntity | FlatFieldMetadata,
): z.ZodTypeAny | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return z
        .object({
          eq: z.string().uuid().optional().describe('Equals'),
          neq: z.string().uuid().optional().describe('Not equals'),
          in: z
            .array(z.string().uuid())
            .optional()
            .describe('In array of values'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (UUID field)`);

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2:
      return z
        .object({
          eq: z.string().optional().describe('Equals'),
          neq: z.string().optional().describe('Not equals'),
          in: z.array(z.string()).optional().describe('In array of values'),
          like: z
            .string()
            .optional()
            .describe('Case-sensitive pattern match (use % for wildcards)'),
          ilike: z
            .string()
            .optional()
            .describe('Case-insensitive pattern match (use % for wildcards)'),
          startsWith: z.string().optional().describe('Starts with'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (text field)`);

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return z
        .object({
          eq: z.number().optional().describe('Equals'),
          neq: z.number().optional().describe('Not equals'),
          gt: z.number().optional().describe('Greater than'),
          gte: z.number().optional().describe('Greater than or equal'),
          lt: z.number().optional().describe('Less than'),
          lte: z.number().optional().describe('Less than or equal'),
          in: z.array(z.number()).optional().describe('In array of values'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (number field)`);

    case FieldMetadataType.BOOLEAN:
      return z
        .object({
          eq: z.boolean().optional().describe('Equals'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (boolean field)`);

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return z
        .object({
          eq: z
            .string()
            .datetime()
            .optional()
            .describe('Equals (ISO datetime string)'),
          neq: z
            .string()
            .datetime()
            .optional()
            .describe('Not equals (ISO datetime string)'),
          gt: z
            .string()
            .datetime()
            .optional()
            .describe('Greater than (ISO datetime string)'),
          gte: z
            .string()
            .datetime()
            .optional()
            .describe('Greater than or equal (ISO datetime string)'),
          lt: z
            .string()
            .datetime()
            .optional()
            .describe('Less than (ISO datetime string)'),
          lte: z
            .string()
            .datetime()
            .optional()
            .describe('Less than or equal (ISO datetime string)'),
          in: z
            .array(z.string().datetime())
            .optional()
            .describe('In array of values (ISO datetime strings)'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (date field)`);

    case FieldMetadataType.SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      if (enumValues.length === 0) {
        return null;
      }

      const selectEnum = z.enum(enumValues as [string, ...string[]]);

      return z
        .object({
          eq: selectEnum.optional().describe('Equals'),
          neq: selectEnum.optional().describe('Not equals'),
          in: z.array(selectEnum).optional().describe('In array of values'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (select field)`);
    }

    case FieldMetadataType.MULTI_SELECT: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      if (enumValues.length === 0) {
        return null;
      }

      const multiSelectEnum = z.enum(enumValues as [string, ...string[]]);

      return z
        .object({
          in: z
            .array(multiSelectEnum)
            .optional()
            .describe('Contains any of these values'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
          isEmptyArray: z.boolean().optional().describe('Is empty array'),
        })
        .optional()
        .describe(`Filter by ${field.name} (multi-select field)`);
    }

    case FieldMetadataType.RATING: {
      const enumValues =
        field.options?.map((option: { value: string }) => option.value) || [];

      if (enumValues.length === 0) {
        return null;
      }

      const ratingEnum = z.enum(enumValues as [string, ...string[]]);

      return z
        .object({
          eq: ratingEnum.optional().describe('Equals'),
          in: z.array(ratingEnum).optional().describe('In array of values'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (rating field)`);
    }

    case FieldMetadataType.ARRAY:
      return z
        .object({
          containsIlike: z
            .string()
            .optional()
            .describe('Contains case-insensitive substring'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
          isEmptyArray: z.boolean().optional().describe('Is empty array'),
        })
        .optional()
        .describe(`Filter by ${field.name} (array field)`);

    case FieldMetadataType.CURRENCY:
      return z
        .object({
          amountMicros: z
            .object({
              eq: z.number().optional().describe('Amount equals'),
              neq: z.number().optional().describe('Amount not equals'),
              gt: z.number().optional().describe('Amount greater than'),
              gte: z
                .number()
                .optional()
                .describe('Amount greater than or equal'),
              lt: z.number().optional().describe('Amount less than'),
              lte: z.number().optional().describe('Amount less than or equal'),
              in: z
                .array(z.number())
                .optional()
                .describe('Amount in array of values'),
              is: NullCheckEnum.optional().describe(
                'Amount is null or not null',
              ),
            })
            .optional()
            .describe('Filter by amount'),
          currencyCode: z
            .object({
              eq: z.string().optional().describe('Currency code equals'),
              neq: z.string().optional().describe('Currency code not equals'),
              in: z
                .array(z.string())
                .optional()
                .describe('Currency code in array of values'),
              is: NullCheckEnum.optional().describe(
                'Currency code is null or not null',
              ),
            })
            .optional()
            .describe('Filter by currency code'),
        })
        .optional()
        .describe(`Filter by ${field.name} (currency field)`);

    case FieldMetadataType.FULL_NAME:
      return z
        .object({
          firstName: z
            .object({
              eq: z.string().optional().describe('First name equals'),
              neq: z.string().optional().describe('First name not equals'),
              like: z
                .string()
                .optional()
                .describe('First name case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('First name case-insensitive pattern match'),
              startsWith: z
                .string()
                .optional()
                .describe('First name starts with'),
              is: NullCheckEnum.optional().describe(
                'First name is null or not null',
              ),
            })
            .optional()
            .describe('Filter by first name'),
          lastName: z
            .object({
              eq: z.string().optional().describe('Last name equals'),
              neq: z.string().optional().describe('Last name not equals'),
              like: z
                .string()
                .optional()
                .describe('Last name case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('Last name case-insensitive pattern match'),
              startsWith: z
                .string()
                .optional()
                .describe('Last name starts with'),
              is: NullCheckEnum.optional().describe(
                'Last name is null or not null',
              ),
            })
            .optional()
            .describe('Filter by last name'),
        })
        .optional()
        .describe(`Filter by ${field.name} (full name field)`);

    case FieldMetadataType.ADDRESS:
      return z
        .object({
          addressStreet1: z
            .object({
              eq: z.string().optional().describe('Street 1 equals'),
              neq: z.string().optional().describe('Street 1 not equals'),
              like: z
                .string()
                .optional()
                .describe('Street 1 case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('Street 1 case-insensitive pattern match'),
              is: NullCheckEnum.optional().describe(
                'Street 1 is null or not null',
              ),
            })
            .optional()
            .describe('Filter by street 1'),
          addressCity: z
            .object({
              eq: z.string().optional().describe('City equals'),
              neq: z.string().optional().describe('City not equals'),
              like: z
                .string()
                .optional()
                .describe('City case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('City case-insensitive pattern match'),
              is: NullCheckEnum.optional().describe('City is null or not null'),
            })
            .optional()
            .describe('Filter by city'),
          addressCountry: z
            .object({
              eq: z.string().optional().describe('Country equals'),
              neq: z.string().optional().describe('Country not equals'),
              like: z
                .string()
                .optional()
                .describe('Country case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('Country case-insensitive pattern match'),
              is: NullCheckEnum.optional().describe(
                'Country is null or not null',
              ),
            })
            .optional()
            .describe('Filter by country'),
        })
        .optional()
        .describe(`Filter by ${field.name} (address field)`);

    case FieldMetadataType.EMAILS:
      return z
        .object({
          primaryEmail: z
            .object({
              eq: z
                .string()
                .email()
                .optional()
                .describe('Primary email equals'),
              neq: z
                .string()
                .email()
                .optional()
                .describe('Primary email not equals'),
              like: z
                .string()
                .optional()
                .describe('Primary email case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('Primary email case-insensitive pattern match'),
              is: NullCheckEnum.optional().describe(
                'Primary email is null or not null',
              ),
            })
            .optional()
            .describe('Filter by primary email'),
        })
        .optional()
        .describe(`Filter by ${field.name} (emails field)`);

    case FieldMetadataType.PHONES:
      return z
        .object({
          primaryPhoneNumber: z
            .object({
              eq: z.string().optional().describe('Primary phone number equals'),
              neq: z
                .string()
                .optional()
                .describe('Primary phone number not equals'),
              like: z
                .string()
                .optional()
                .describe('Primary phone number case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe(
                  'Primary phone number case-insensitive pattern match',
                ),
              is: NullCheckEnum.optional().describe(
                'Primary phone number is null or not null',
              ),
            })
            .optional()
            .describe('Filter by primary phone number'),
        })
        .optional()
        .describe(`Filter by ${field.name} (phones field)`);

    case FieldMetadataType.LINKS:
      return z
        .object({
          primaryLinkUrl: z
            .object({
              eq: z
                .string()
                .url()
                .optional()
                .describe('Primary link URL equals'),
              neq: z
                .string()
                .url()
                .optional()
                .describe('Primary link URL not equals'),
              like: z
                .string()
                .optional()
                .describe('Primary link URL case-sensitive pattern match'),
              ilike: z
                .string()
                .optional()
                .describe('Primary link URL case-insensitive pattern match'),
              is: NullCheckEnum.optional().describe(
                'Primary link URL is null or not null',
              ),
            })
            .optional()
            .describe('Filter by primary link URL'),
        })
        .optional()
        .describe(`Filter by ${field.name} (links field)`);

    case FieldMetadataType.RELATION:
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        const fieldName = `${field.name}Id`;

        return z
          .object({
            eq: z
              .string()
              .uuid()
              .optional()
              .describe('Related record ID equals'),
            neq: z
              .string()
              .uuid()
              .optional()
              .describe('Related record ID not equals'),
            in: z
              .array(z.string().uuid())
              .optional()
              .describe('Related record ID in array of values'),
            is: NullCheckEnum.optional().describe(
              'Related record ID is null or not null',
            ),
          })
          .optional()
          .describe(`Filter by ${fieldName} (relation field)`);
      }

      return null;

    case FieldMetadataType.RAW_JSON:
      return z
        .object({
          eq: z.string().optional().describe('Raw JSON equals'),
          neq: z.string().optional().describe('Raw JSON not equals'),
          like: z
            .string()
            .optional()
            .describe('Raw JSON case-sensitive pattern match'),
          ilike: z
            .string()
            .optional()
            .describe('Raw JSON case-insensitive pattern match'),
          is: NullCheckEnum.optional().describe('Raw JSON is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (raw JSON field)`);

    default:
      return z
        .object({
          eq: z.string().optional().describe('Equals'),
          neq: z.string().optional().describe('Not equals'),
          like: z.string().optional().describe('Case-sensitive pattern match'),
          ilike: z
            .string()
            .optional()
            .describe('Case-insensitive pattern match'),
          is: NullCheckEnum.optional().describe('Is null or not null'),
        })
        .optional()
        .describe(`Filter by ${field.name} (string field)`);
  }
};
