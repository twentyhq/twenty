import { isUndefined } from '@sniptt/guards';
import { v4 } from 'uuid';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { isDefined } from '~/utils/isDefined';

export const prefillRecord = <T extends ObjectRecord>({
  objectMetadataItem,
  input,
  depth = 1,
}: {
  objectMetadataItem: ObjectMetadataItem;
  input: Record<string, unknown>;
  depth?: number;
}) => {
  const record = Object.fromEntries(
    objectMetadataItem.fields
      .filter(
        (fieldMetadataItem) =>
          depth > 0 || fieldMetadataItem.type !== 'RELATION',
      )
      .map((fieldMetadataItem) => {
        const inputValue = input[fieldMetadataItem.name];

        if (
          isUndefined(inputValue) &&
          ['id', 'createdAt', 'updatedAt'].includes(fieldMetadataItem.name)
        ) {
          return undefined;
        }
        return [
          fieldMetadataItem.name,
          isUndefined(inputValue)
            ? generateEmptyFieldValue(fieldMetadataItem)
            : inputValue,
        ];
      })
      .filter(isDefined),
  );

  return {
    id: v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...record,
  } as T;
};
