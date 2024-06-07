import deepEqual from 'deep-equal';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const objectRecordChangedValues = (
  oldRecord: Record<string, any>,
  newRecord: Record<string, any>,
  objectMetadata: ObjectMetadataInterface,
) => {
  const changedValues = Object.keys(newRecord).reduce(
    (acc, key) => {
      if (
        objectMetadata.fields.find(
          (field) =>
            field.type === FieldMetadataType.RELATION && field.name === key,
        )
      ) {
        return acc;
      }

      if (objectMetadata.nameSingular === 'activity' && key === 'body') {
        return acc;
      }

      if (!deepEqual(oldRecord[key], newRecord[key]) && key !== 'updatedAt') {
        acc[key] = { before: oldRecord[key], after: newRecord[key] };
      }

      return acc;
    },
    {} as Record<string, { before: any; after: any }>,
  );

  return changedValues;
};
