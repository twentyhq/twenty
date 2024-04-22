import { isUndefined } from '@sniptt/guards';

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
  return Object.fromEntries(
    objectMetadataItem.fields
      .filter(
        (fieldMetadataItem) =>
          depth > 0 || fieldMetadataItem.type !== 'RELATION',
      )
      .map((fieldMetadataItem) => {
        const inputValue = input[fieldMetadataItem.name];

        return [
          fieldMetadataItem.name,
          isUndefined(inputValue)
            ? generateEmptyFieldValue(fieldMetadataItem)
            : inputValue,
        ];
      })
      .filter(isDefined),
  ) as T;
};
