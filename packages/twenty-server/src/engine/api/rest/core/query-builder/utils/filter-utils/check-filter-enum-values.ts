import { BadRequestException } from '@nestjs/common';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { FieldMetadataType } from 'twenty-shared/types';

export const checkFilterEnumValues = (
  fieldType: FieldMetadataType | undefined,
  fieldName: string,
  value: string,
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
): void => {
  if (
    !fieldType ||
    ![FieldMetadataType.MULTI_SELECT, FieldMetadataType.SELECT].includes(
      fieldType,
    )
  ) {
    return;
  }
  const field = objectMetadataItem.fieldsByName[fieldName];

  const values = /^\[.*\]$/.test(value)
    ? value.slice(1, -1).split(',')
    : [value];
  const enumValues = field?.options?.map((option) => option.value);

  if (!enumValues) {
    return;
  }
  values.forEach((val) => {
    if (!enumValues.includes(val)) {
      throw new BadRequestException(
        `'filter' enum value '${val}' not available in '${fieldName}' enum. Available enum values are ['${enumValues.join(
          "', '",
        )}']`,
      );
    }
  });
};
