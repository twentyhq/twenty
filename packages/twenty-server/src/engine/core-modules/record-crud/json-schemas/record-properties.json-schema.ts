import { isNonEmptyString } from '@sniptt/guards';
import { type JSONSchema7 } from 'json-schema';
import {
  FieldMetadataType,
  NumberDataType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { filesFieldSchema } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { SHARED_VALUE_JSON_SCHEMAS } from 'src/engine/core-modules/record-crud/json-schemas/shared-value-definitions.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { getFieldOptionValues } from 'src/engine/core-modules/record-crud/utils/get-field-option-values.util';
import { getManyToOneJoinColumnName } from 'src/engine/core-modules/record-crud/utils/get-many-to-one-join-column-name.util';
import { referenceJsonSchemaDefinition } from 'src/engine/core-modules/record-crud/utils/reference-json-schema-definition.util';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

type SharedValueName = keyof typeof SHARED_VALUE_JSON_SCHEMAS;

const SYSTEM_MANAGED_FIELD_NAMES = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
]);

const SHARED_VALUE_NAME_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, SharedValueName>
> = {
  [FieldMetadataType.UUID]: 'UuidValue',
  [FieldMetadataType.LINKS]: 'LinksValue',
  [FieldMetadataType.CURRENCY]: 'CurrencyValue',
  [FieldMetadataType.FULL_NAME]: 'FullNameValue',
  [FieldMetadataType.ADDRESS]: 'AddressValue',
  [FieldMetadataType.EMAILS]: 'EmailsValue',
  [FieldMetadataType.PHONES]: 'PhonesValue',
  [FieldMetadataType.RICH_TEXT]: 'RichTextValue',
};

const ACTOR_SOURCES = [
  'EMAIL',
  'CALENDAR',
  'WORKFLOW',
  'AGENT',
  'API',
  'IMPORT',
  'MANUAL',
  'SYSTEM',
  'WEBHOOK',
];

const FILES_JSON_SCHEMA = toToolJsonSchema(filesFieldSchema);

const POSITION_JSON_SCHEMA: JSONSchema7 = {
  description:
    'Use "first" to insert at the top, "last" for the bottom, or a number for explicit ordering. Leave empty to place at the top (recommended).',
  anyOf: [
    { type: 'number' },
    { type: 'string', const: 'first' },
    { type: 'string', const: 'last' },
  ],
};

const getOptionsJsonSchema = (field: FlatFieldMetadata): JSONSchema7 => {
  const optionValues = getFieldOptionValues(field);

  return optionValues.length > 0
    ? { type: 'string', enum: optionValues }
    : { type: 'string' };
};

const getFieldValueJsonSchema = ({
  field,
  definitions,
}: {
  field: FlatFieldMetadata;
  definitions: JsonSchemaDefinitions;
}): JSONSchema7 => {
  const sharedValueName = SHARED_VALUE_NAME_BY_FIELD_TYPE[field.type];

  if (isDefined(sharedValueName)) {
    return referenceJsonSchemaDefinition({
      definitions,
      name: sharedValueName,
      schema: SHARED_VALUE_JSON_SCHEMAS[sharedValueName],
    });
  }

  if (isFlatFieldMetadataOfType(field, FieldMetadataType.NUMBER)) {
    const isDecimal =
      field.settings?.dataType === NumberDataType.FLOAT ||
      (field.settings?.decimals ?? 0) > 0;

    return { type: isDecimal ? 'number' : 'integer' };
  }

  switch (field.type) {
    case FieldMetadataType.DATE_TIME:
      return { type: 'string', format: 'date-time' };
    case FieldMetadataType.DATE:
      return { type: 'string', format: 'date' };
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.POSITION:
      return { type: 'number' };
    case FieldMetadataType.BOOLEAN:
      return { type: 'boolean' };
    case FieldMetadataType.RAW_JSON:
      return {
        type: 'object',
        propertyNames: { type: 'string' },
        additionalProperties: {},
      };
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return getOptionsJsonSchema(field);
    case FieldMetadataType.MULTI_SELECT:
      return { type: 'array', items: getOptionsJsonSchema(field) };
    case FieldMetadataType.ARRAY:
      return { type: 'array', items: { type: 'string' } };
    case FieldMetadataType.ACTOR:
      return {
        type: 'object',
        properties: { source: { type: 'string', enum: ACTOR_SOURCES } },
      };
    case FieldMetadataType.FILES:
      return FILES_JSON_SCHEMA;
    default:
      return { type: 'string' };
  }
};

const getPropertyJsonSchema = ({
  field,
  definitions,
}: {
  field: FlatFieldMetadata;
  definitions: JsonSchemaDefinitions;
}): JSONSchema7 => {
  if (field.name === 'position') {
    return POSITION_JSON_SCHEMA;
  }

  return {
    ...(isNonEmptyString(field.description) && {
      description: field.description,
    }),
    ...getFieldValueJsonSchema({ field, definitions }),
  };
};

export const generateRecordPropertiesJsonSchema = ({
  objectMetadata,
  restrictedFields,
  definitions,
  isPartial = false,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
  definitions: JsonSchemaDefinitions;
  isPartial?: boolean;
}): { properties: Record<string, JSONSchema7>; required: string[] } => {
  const properties: Record<string, JSONSchema7> = {};
  const required: string[] = [];

  for (const field of objectMetadata.fields) {
    if (
      SYSTEM_MANAGED_FIELD_NAMES.has(field.name) ||
      field.type === FieldMetadataType.TS_VECTOR ||
      restrictedFields?.[field.id]?.canUpdate === false
    ) {
      continue;
    }

    const isRelation = isMorphOrRelationFlatFieldMetadata(field);
    const propertyName = isRelation
      ? getManyToOneJoinColumnName(field)
      : field.name;

    if (!isDefined(propertyName)) {
      continue;
    }

    properties[propertyName] = isRelation
      ? referenceJsonSchemaDefinition({
          definitions,
          name: 'UuidValue',
          schema: SHARED_VALUE_JSON_SCHEMAS.UuidValue,
        })
      : getPropertyJsonSchema({ field, definitions });

    if (!field.isNullable && !isPartial) {
      required.push(propertyName);
    }
  }

  return { properties, required };
};
