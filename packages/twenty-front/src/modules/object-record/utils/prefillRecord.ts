import { isUndefined } from '@sniptt/guards';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { isDefined } from '~/utils/isDefined';

export const prefillRecord = <T extends ObjectRecord>({
  objectMetadataItem,
  input,
}: {
  objectMetadataItem: ObjectMetadataItem;
  input: Record<string, unknown>;
}) => {
  return Object.fromEntries(
    objectMetadataItem.fields
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
