import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const getFieldType = (
  objectMetadataItem,
  fieldName,
): FieldMetadataType | undefined => {
  for (const itemField of objectMetadataItem.fields) {
    if (fieldName === itemField.name) {
      return itemField.type;
    }
  }
};

export const checkFields = (objectMetadataItem, fieldNames): void => {
  for (const fieldName of fieldNames) {
    if (
      !objectMetadataItem.fields
        .reduce(
          (acc, itemField) => [
            ...acc,
            itemField.name,
            ...Object.keys(itemField.targetColumnMap),
          ],
          [],
        )
        .includes(fieldName)
    ) {
      throw new BadRequestException(
        `field '${fieldName}' does not exist in '${computeObjectTargetTable(
          objectMetadataItem,
        )}' object`,
      );
    }
  }
};
