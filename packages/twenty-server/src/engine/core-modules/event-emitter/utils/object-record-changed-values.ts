import deepEqual from 'deep-equal';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const objectRecordChangedValues = (
  oldRecord: Partial<IRecord>,
  newRecord: Partial<IRecord>,
  updatedKeys: string[],
  objectMetadata: ObjectMetadataInterface,
) => {
  const fieldsByKey = new Map(
    objectMetadata.fields.map((field) => [field.name, field]),
  );

  const changedValues = Object.keys(newRecord).reduce(
    (acc, key) => {
      const field = fieldsByKey.get(key);
      const oldRecordValue = oldRecord[key];
      const newRecordValue = newRecord[key];

      if (
        key === 'updatedAt' ||
        !updatedKeys.includes(key) ||
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

  return changedValues;
};
