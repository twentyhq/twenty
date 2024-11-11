import deepEqual from 'deep-equal';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export const objectRecordChangedValues = (
  oldRecord: Partial<ObjectRecord>,
  newRecord: Partial<ObjectRecord>,
  updatedKeys: string[] | undefined,
  ObjectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) => {
  return Object.keys(newRecord).reduce(
    (acc, key) => {
      const field = ObjectMetadataItemWithFieldMaps.fieldsByName[key];
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
