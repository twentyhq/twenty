import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const checkFilterEnumValues = (
  fieldType: FieldMetadataType | undefined,
  fieldName: string,
  value: string,
  objectMetadataItem: ObjectMetadataInterface,
): void => {
  if (
    !fieldType ||
    ![FieldMetadataType.MULTI_SELECT, FieldMetadataType.SELECT].includes(
      fieldType,
    )
  ) {
    return;
  }
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

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
