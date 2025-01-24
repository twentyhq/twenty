import deepEqual from 'deep-equal';
import { FieldMetadataType } from 'twenty-shared';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const objectRecordChangedValues = (
  oldRecord: Partial<ObjectRecord>,
  newRecord: Partial<ObjectRecord>,
  updatedKeys: string[] | undefined,
  objectMetadataItem: ObjectMetadataInterface,
) => {
  return Object.keys(newRecord).reduce(
    (acc, key) => {
      const field = objectMetadataItem.fields.find((f) => f.name === key);
      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      if (
        key === 'updatedAt' ||
        !updatedKeys?.includes(key) ||
        field?.type === FieldMetadataType.RELATION ||
        deepEqual(oldRecordValue, newRecordValue)
      ) {
        return acc;
      }

      acc[key] = { before: oldRecordValue, after: newRecordValue };

      return acc;
    },
    {} as Record<string, { before: any; after: any }>,
  );
};
