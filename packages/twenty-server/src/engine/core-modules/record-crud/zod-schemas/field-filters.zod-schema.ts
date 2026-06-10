import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import {
  AddressFilterSchema,
  ArrayFieldFilterSchema,
  BooleanFilterSchema,
  CurrencyFilterSchema,
  DateFilterSchema,
  DefaultFilterSchema,
  EmailsFilterSchema,
  FullNameFilterSchema,
  LinksFilterSchema,
  NullCheckEnum,
  NumberFilterSchema,
  PhonesFilterSchema,
  TextFilterSchema,
  UuidFilterSchema,
} from 'src/engine/core-modules/record-crud/zod-schemas/shared-filter-defs.zod-schema';

export { NullCheckEnum };

export const generateFieldFilterZodSchema = (
  field: FieldMetadataEntity | FlatFieldMetadata,
): z.ZodTypeAny | null => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return UuidFilterSchema;

    case FieldMetadataType.TEXT:
    case FieldMetadataType.RICH_TEXT:
      return TextFilterSchema;

    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return NumberFilterSchema;

    case FieldMetadataType.BOOLEAN:
      return BooleanFilterSchema;

    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
      return DateFilterSchema;

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
          is: NullCheckEnum.optional(),
        })
        .optional();
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
          is: NullCheckEnum.optional(),
          isEmptyArray: z.boolean().optional().describe('Is empty array'),
        })
        .optional();
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
          is: NullCheckEnum.optional(),
        })
        .optional();
    }

    case FieldMetadataType.ARRAY:
      return ArrayFieldFilterSchema;

    case FieldMetadataType.CURRENCY:
      return CurrencyFilterSchema;

    case FieldMetadataType.FULL_NAME:
      return FullNameFilterSchema;

    case FieldMetadataType.ADDRESS:
      return AddressFilterSchema;

    case FieldMetadataType.EMAILS:
      return EmailsFilterSchema;

    case FieldMetadataType.PHONES:
      return PhonesFilterSchema;

    case FieldMetadataType.LINKS:
      return LinksFilterSchema;

    case FieldMetadataType.RELATION:
      if (
        isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) &&
        field.settings?.relationType === RelationType.MANY_TO_ONE
      ) {
        return UuidFilterSchema;
      }

      return null;

    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.FILES:
      return DefaultFilterSchema;

    default:
      return DefaultFilterSchema;
  }
};
