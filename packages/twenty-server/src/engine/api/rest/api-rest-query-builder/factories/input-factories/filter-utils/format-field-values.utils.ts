import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldValue } from 'src/engine/api/rest/types/api-rest-field-value.type';

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
  if (fieldType === FieldMetadataType.NUMBER) {
    return parseInt(value);
  }
  if (fieldType === FieldMetadataType.BOOLEAN) {
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
