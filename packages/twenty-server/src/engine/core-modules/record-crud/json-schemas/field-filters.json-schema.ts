import { type JSONSchema7 } from 'json-schema';
import { FieldMetadataType } from 'twenty-shared/types';

import { SHARED_FILTER_JSON_SCHEMAS } from 'src/engine/core-modules/record-crud/json-schemas/shared-filter-definitions.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { getFieldOptionValues } from 'src/engine/core-modules/record-crud/utils/get-field-option-values.util';
import { referenceJsonSchemaDefinition } from 'src/engine/core-modules/record-crud/utils/reference-json-schema-definition.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

type SharedFilterName = keyof typeof SHARED_FILTER_JSON_SCHEMAS;

const SHARED_FILTER_NAME_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, SharedFilterName>
> = {
  [FieldMetadataType.UUID]: 'UuidFilter',
  [FieldMetadataType.TEXT]: 'TextFilter',
  [FieldMetadataType.RICH_TEXT]: 'RichTextFilter',
  [FieldMetadataType.NUMBER]: 'NumberFilter',
  [FieldMetadataType.NUMERIC]: 'NumberFilter',
  [FieldMetadataType.POSITION]: 'NumberFilter',
  [FieldMetadataType.BOOLEAN]: 'BooleanFilter',
  [FieldMetadataType.DATE_TIME]: 'DateFilter',
  [FieldMetadataType.DATE]: 'DateFilter',
  [FieldMetadataType.ARRAY]: 'ArrayFilter',
  [FieldMetadataType.CURRENCY]: 'CurrencyFilter',
  [FieldMetadataType.FULL_NAME]: 'FullNameFilter',
  [FieldMetadataType.ADDRESS]: 'AddressFilter',
  [FieldMetadataType.EMAILS]: 'EmailsFilter',
  [FieldMetadataType.PHONES]: 'PhonesFilter',
  [FieldMetadataType.LINKS]: 'LinksFilter',
  [FieldMetadataType.RAW_JSON]: 'RawJsonFilter',
  [FieldMetadataType.FILES]: 'RawJsonFilter',
};

const referenceSharedFilter = ({
  definitions,
  name,
}: {
  definitions: JsonSchemaDefinitions;
  name: SharedFilterName;
}): JSONSchema7 =>
  referenceJsonSchemaDefinition({
    definitions,
    name,
    schema: SHARED_FILTER_JSON_SCHEMAS[name],
  });

const buildOptionsFilter = ({
  field,
  optionValues,
  nullCheck,
}: {
  field: FlatFieldMetadata;
  optionValues: string[];
  nullCheck: JSONSchema7;
}): JSONSchema7 => {
  const option: JSONSchema7 = { type: 'string', enum: optionValues };

  if (field.type === FieldMetadataType.MULTI_SELECT) {
    return {
      type: 'object',
      properties: {
        in: {
          description: 'Contains any of these values',
          type: 'array',
          items: option,
        },
        is: nullCheck,
        isEmptyArray: { description: 'Is empty array', type: 'boolean' },
      },
    };
  }

  return {
    type: 'object',
    properties: {
      eq: { description: 'Equals', ...option },
      ...(field.type === FieldMetadataType.SELECT && {
        neq: { description: 'Not equals', ...option },
      }),
      in: { description: 'In array of values', type: 'array', items: option },
      is: nullCheck,
    },
  };
};

export const generateFieldFilterJsonSchema = ({
  field,
  definitions,
}: {
  field: FlatFieldMetadata;
  definitions: JsonSchemaDefinitions;
}): JSONSchema7 | null => {
  const nullCheck = referenceSharedFilter({ definitions, name: 'NullCheck' });

  if (isMorphOrRelationFlatFieldMetadata(field)) {
    return isManyToOneFlatFieldMetadata(field)
      ? referenceSharedFilter({ definitions, name: 'UuidFilter' })
      : null;
  }

  if (
    field.type === FieldMetadataType.SELECT ||
    field.type === FieldMetadataType.MULTI_SELECT ||
    field.type === FieldMetadataType.RATING
  ) {
    const optionValues = getFieldOptionValues(field);

    if (optionValues.length === 0) {
      return null;
    }

    return referenceJsonSchemaDefinition({
      definitions,
      name: `${field.name}Filter`,
      schema: buildOptionsFilter({ field, optionValues, nullCheck }),
    });
  }

  return referenceSharedFilter({
    definitions,
    name: SHARED_FILTER_NAME_BY_FIELD_TYPE[field.type] ?? 'DefaultFilter',
  });
};
