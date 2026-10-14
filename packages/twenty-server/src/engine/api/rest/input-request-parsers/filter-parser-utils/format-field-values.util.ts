import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldValue } from 'src/engine/api/rest/core/types/field-value.type';
import {
  type FilterQuoteCharacter,
  getOpenQuoteAfterCharacter,
} from 'src/engine/api/rest/input-request-parsers/filter-parser-utils/get-open-quote-after-character.util';

const splitArrayItems = (arrayContent: string): string[] => {
  const items: string[] = [];
  let currentItem = '';
  let openQuote: FilterQuoteCharacter | null = null;
  // The content starts right after the array opening bracket
  let previousCharacter = '[';

  for (const c of arrayContent) {
    openQuote = getOpenQuoteAfterCharacter({
      character: c,
      previousCharacter,
      openQuote,
    });
    previousCharacter = c;

    if (c === ',' && !isDefined(openQuote)) {
      items.push(currentItem);
      currentItem = '';
      continue;
    }

    currentItem += c;
  }

  items.push(currentItem);

  return items;
};

export const formatFieldValue = (
  value: string,
  fieldType?: FieldMetadataType,
  comparator?: string,
): FieldValue => {
  if (isDefined(comparator) && ['in', 'containsAny'].includes(comparator)) {
    if (value[0] !== '[' || value[value.length - 1] !== ']') {
      throw new BadRequestException(
        `'filter' invalid for '${comparator}' operator. Received '${value}' but array value expected eg: 'field[${comparator}]:[value_1,value_2]'`,
      );
    }
    const stringValues = value.substring(1, value.length - 1);

    return splitArrayItems(stringValues).map((value) =>
      formatFieldValue(value, fieldType),
    );
  }
  if (comparator === 'is') {
    return value;
  }
  switch (fieldType) {
    case FieldMetadataType.NUMERIC:
      return parseInt(value);
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.POSITION:
      return parseFloat(value);
    case FieldMetadataType.BOOLEAN:
      return value.toLowerCase() === 'true';
  }

  if (
    (value[0] === '"' || value[0] === "'") &&
    (value.charAt(value.length - 1) === '"' ||
      value.charAt(value.length - 1) === "'")
  ) {
    return value.substring(1, value.length - 1);
  }

  return value;
};
