import {
  type FieldMetadataSettings,
  FieldMetadataType,
  NumberDataType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { filesFieldSchema } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import {
  AddressValueOptionalSchema,
  AddressValueSchema,
  CurrencyResponseValueOptionalSchema,
  CurrencyResponseValueSchema,
  CurrencyValueOptionalSchema,
  CurrencyValueSchema,
  EmailsValueOptionalSchema,
  EmailsValueSchema,
  FullNameValueOptionalSchema,
  FullNameValueSchema,
  LinksValueOptionalSchema,
  LinksValueSchema,
  PhonesValueOptionalSchema,
  PhonesValueSchema,
  RichTextValueOptionalSchema,
  RichTextValueSchema,
  UuidValueOptionalSchema,
  UuidValueSchema,
} from 'src/engine/core-modules/record-crud/zod-schemas/shared-value-defs.zod-schema';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const isFieldAvailable = (field: FlatFieldMetadata, forResponse: boolean) => {
  if (forResponse) {
    return true;
  }
  switch (field.name) {
    case 'id':
    case 'createdAt':
    case 'updatedAt':
    case 'deletedAt':
    case 'createdBy':
    case 'updatedBy':
      return false;
    default:
      return true;
  }
};

const getFieldZodType = (field: FlatFieldMetadata): z.ZodTypeAny => {
  switch (field.type) {
    case FieldMetadataType.UUID:
      return UuidValueSchema;

    case FieldMetadataType.TEXT:
      return z.string();

    case FieldMetadataType.DATE_TIME:
      return z.string().datetime();

    case FieldMetadataType.DATE:
      return z.string().date();

    case FieldMetadataType.NUMBER: {
      const settings =
        field.settings as FieldMetadataSettings<FieldMetadataType.NUMBER>;

      if (
        settings?.dataType === NumberDataType.FLOAT ||
        (isDefined(settings?.decimals) && settings.decimals > 0)
      ) {
        return z.number();
      }

      return z.number().int();
    }

    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return z.number();

    case FieldMetadataType.BOOLEAN:
      return z.boolean();

    case FieldMetadataType.RAW_JSON:
      return z.record(z.string(), z.unknown());

    default:
      return z.string();
  }
};

export const generateRecordPropertiesZodSchema = (
  objectMetadata: ObjectMetadataForToolSchema,
  forResponse = false,
  restrictedFields?: RestrictedFieldsPermissions,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  objectMetadata.fields.forEach((field) => {
    if (
      !isFieldAvailable(field, forResponse) ||
      field.type === FieldMetadataType.TS_VECTOR
    ) {
      return;
    }

    if (restrictedFields?.[field.id]?.canUpdate === false) {
      return;
    }

    const isRelationOrMorphRelation =
      isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
      isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION);

    if (
      isRelationOrMorphRelation &&
      field.settings?.relationType === RelationType.MANY_TO_ONE
    ) {
      shape[`${field.name}Id`] = field.isNullable
        ? UuidValueOptionalSchema
        : UuidValueSchema;

      return;
    }

    if (
      isRelationOrMorphRelation &&
      field.settings?.relationType === RelationType.ONE_TO_MANY
    ) {
      return;
    }

    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case FieldMetadataType.MULTI_SELECT: {
        const enumValues =
          field.options?.map((option: { value: string }) => option.value) || [];

        if (enumValues.length > 0) {
          fieldSchema = z.array(z.enum(enumValues as [string, ...string[]]));
        } else {
          fieldSchema = z.array(z.string());
        }
        break;
      }

      case FieldMetadataType.SELECT: {
        const enumValues =
          field.options?.map((option: { value: string }) => option.value) || [];

        if (enumValues.length > 0) {
          fieldSchema = z.enum(enumValues as [string, ...string[]]);
        } else {
          fieldSchema = z.string();
        }
        break;
      }

      case FieldMetadataType.ARRAY:
        fieldSchema = z.array(z.string());
        break;

      case FieldMetadataType.RATING: {
        const enumValues =
          field.options?.map((option: { value: string }) => option.value) || [];

        if (enumValues.length > 0) {
          fieldSchema = z.enum(enumValues as [string, ...string[]]);
        } else {
          fieldSchema = z.string();
        }
        break;
      }

      case FieldMetadataType.LINKS: {
        const baseSchema = field.isNullable
          ? LinksValueOptionalSchema
          : LinksValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.CURRENCY: {
        const baseSchema = forResponse
          ? field.isNullable
            ? CurrencyResponseValueOptionalSchema
            : CurrencyResponseValueSchema
          : field.isNullable
            ? CurrencyValueOptionalSchema
            : CurrencyValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.FULL_NAME: {
        const baseSchema = field.isNullable
          ? FullNameValueOptionalSchema
          : FullNameValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.ADDRESS: {
        const baseSchema = field.isNullable
          ? AddressValueOptionalSchema
          : AddressValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.ACTOR:
        fieldSchema = z.object({
          source: z
            .enum([
              'EMAIL',
              'CALENDAR',
              'WORKFLOW',
              'AGENT',
              'API',
              'IMPORT',
              'MANUAL',
              'SYSTEM',
              'WEBHOOK',
            ])
            .optional(),
          ...(forResponse
            ? {
                workspaceMemberId: z.string().uuid().optional(),
                name: z.string().optional(),
              }
            : {}),
        });
        break;

      case FieldMetadataType.EMAILS: {
        const baseSchema = field.isNullable
          ? EmailsValueOptionalSchema
          : EmailsValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.PHONES: {
        const baseSchema = field.isNullable
          ? PhonesValueOptionalSchema
          : PhonesValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.RICH_TEXT: {
        const baseSchema = field.isNullable
          ? RichTextValueOptionalSchema
          : RichTextValueSchema;

        shape[field.name] = field.description
          ? baseSchema.describe(field.description)
          : baseSchema;
        return;
      }

      case FieldMetadataType.FILES:
        fieldSchema = filesFieldSchema;
        break;

      default:
        fieldSchema = getFieldZodType(field);
        break;
    }

    if (field.name === 'position') {
      fieldSchema = z.union([
        z.number(),
        z.literal('first'),
        z.literal('last'),
      ]);

      fieldSchema = fieldSchema.describe(
        'Use "first" to insert at the top, "last" for the bottom, or a number for explicit ordering. Leave empty to place at the top (recommended).',
      );
    } else if (field.description) {
      fieldSchema = fieldSchema.describe(field.description);
    }

    if (field.isNullable) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
};
