import { type ObjectFieldManifest } from 'twenty-shared/application';
import { COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from 'twenty-shared/constants';
import {
  fieldMetadataDefaultValueFunctionName,
  type FieldMetadataDefaultValueFunctionNames,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { isString } from '@sniptt/guards';

const isQuotedString = (value: string): boolean =>
  value.length >= 2 && value.startsWith("'") && value.endsWith("'");

const isComputedDefaultValue = (value: string): boolean =>
  Object.values(fieldMetadataDefaultValueFunctionName).includes(
    value as FieldMetadataDefaultValueFunctionNames,
  );

const collectUnquotedStrings = (field: ObjectFieldManifest): string[] => {
  const { defaultValue, type } = field;

  if (!isDefined(defaultValue)) {
    return [];
  }

  if (isString(defaultValue)) {
    return isQuotedString(defaultValue) || isComputedDefaultValue(defaultValue)
      ? []
      : [defaultValue];
  }

  if (
    Array.isArray(defaultValue) &&
    (type === FieldMetadataType.MULTI_SELECT ||
      type === FieldMetadataType.ARRAY)
  ) {
    return defaultValue.filter(
      (item): item is string =>
        typeof item === 'string' && !isQuotedString(item),
    );
  }

  if (
    type in COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES &&
    isPlainObject(defaultValue)
  ) {
    return Object.values(defaultValue).filter(
      (value): value is string =>
        typeof value === 'string' && !isQuotedString(value),
    );
  }

  return [];
};

export const getFieldDefaultValueWarnings = (
  fields: ObjectFieldManifest[] | undefined,
): string[] => {
  if (!isDefined(fields)) {
    return [];
  }

  return fields.flatMap((field) => {
    const unquotedStrings = collectUnquotedStrings(field);

    if (unquotedStrings.length === 0) {
      return [];
    }

    const quotedExample = unquotedStrings[0];

    return [
      `Field "${field.label}" has string defaultValue(s) without surrounding single quotes: ${unquotedStrings
        .map((value) => `"${value}"`)
        .join(
          ', ',
        )}. Unquoted strings are reserved for computed defaults ('uuid', 'now'). To define a literal string default, wrap it in single quotes: "'${quotedExample}'" instead of "${quotedExample}".`,
    ];
  });
};
