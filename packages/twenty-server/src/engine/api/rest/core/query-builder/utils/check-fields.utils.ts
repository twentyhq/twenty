import { BadRequestException } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const checkFields = (
  objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps,
  fieldNames: string[],
): void => {
  const fieldMetadataNames: string[] = Object.values(
    objectMetadataItemWithFieldsMaps.fieldsById,
  )
    .flatMap((field) => {
      if (isCompositeFieldMetadataType(field.type)) {
        const compositeType = compositeTypeDefinitions.get(field.type);

        if (!compositeType) {
          throw new BadRequestException(
            `Composite type '${field.type}' not found`,
          );
        }

        // TODO: Don't really know why we need to put fieldName and compositeType name here
        return [
          field.name,
          compositeType.properties.map(
            (compositeProperty) => compositeProperty.name,
          ),
        ].flat();
      }

      if (isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION)) {
        return field.settings?.joinColumnName;
      }

      return field.name;
    })
    .filter(isDefined);

  for (const fieldName of fieldNames) {
    if (!fieldMetadataNames.includes(fieldName)) {
      throw new BadRequestException(
        `field '${fieldName}' does not exist in '${computeObjectTargetTable(
          objectMetadataItemWithFieldsMaps,
        )}' object`,
      );
    }
  }
};
