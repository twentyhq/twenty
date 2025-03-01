import { BadRequestException } from '@nestjs/common';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const checkArrayFields = (
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
  fields: Array<Partial<ObjectRecord>>,
): void => {
  const fieldMetadataNames = objectMetadataItem.fields
    .map((field) => {
      if (isCompositeFieldMetadataType(field.type)) {
        const compositeType = compositeTypeDefinitions.get(field.type);

        if (!compositeType) {
          throw new BadRequestException(
            `Composite type '${field.type}' not found`,
          );
        }

        return [
          field.name,
          compositeType.properties.map(
            (compositeProperty) => compositeProperty.name,
          ),
        ].flat();
      }

      return field.name;
    })
    .flat();

  for (const fieldObj of fields) {
    for (const fieldName in fieldObj) {
      if (!fieldMetadataNames.includes(fieldName)) {
        throw new BadRequestException(
          `field '${fieldName}' does not exist in '${computeObjectTargetTable(
            objectMetadataItem,
          )}' object`,
        );
      }
    }
  }
};
