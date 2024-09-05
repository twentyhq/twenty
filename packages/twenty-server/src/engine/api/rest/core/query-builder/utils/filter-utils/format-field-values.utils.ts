import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldValue } from 'src/engine/api/rest/core/types/field-value.type';

export const formatFieldValue = (
  value: string,
  fieldType?: FieldMetadataType,
  comparator?: string,
): FieldValue => {
  if (comparator === 'in') {
    if (value[0] !== '[' || value[value.length - 1] !== ']') {
      throw new BadRequestException(
        `'filter' invalid for 'in' operator. Received '${value}' but array value expected eg: 'field[in]:[value_1,value_2]'`,
      );
    }
    const stringValues = value.substring(1, value.length - 1);

    return stringValues
      .split(',')
      .map((value) => formatFieldValue(value, fieldType));
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
