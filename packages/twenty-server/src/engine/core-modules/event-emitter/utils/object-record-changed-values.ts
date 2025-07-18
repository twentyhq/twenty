import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared/types';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const objectRecordChangedValues = (
  oldRecord: Partial<ObjectRecord>,
  newRecord: Partial<ObjectRecord>,
  objectMetadataItem: ObjectMetadataItemWithFieldMaps,
) => {
  return Object.keys(newRecord).reduce(
    (acc, key) => {
      const field =
        objectMetadataItem.fieldsById[objectMetadataItem.fieldIdByName[key]];

      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      if (
        key === 'updatedAt' ||
        key === 'searchVector' ||
        field?.type === FieldMetadataType.RELATION ||
        deepEqual(oldRecordValue, newRecordValue)
      ) {
        return acc;
      }

      acc[key] = { before: oldRecordValue, after: newRecordValue };

      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, { before: any; after: any }>,
  );
};
