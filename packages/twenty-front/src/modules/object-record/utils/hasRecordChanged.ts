import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const hasRecordChanged = ({
  cachedRecord,
  newRecord,
  objectMetadataItem,
}: {
  cachedRecord: any;
  newRecord: any;
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  if (!isDefined(cachedRecord) || !isDefined(newRecord)) {
    return true;
  }

  const fieldsToCompare = objectMetadataItem.fields.filter(
    (field) =>
      !['id', 'createdAt', 'updatedAt'].includes(field.name) &&
      field.type !== FieldMetadataType.TS_VECTOR,
  );

  const normalizeValue = (value: any): any => {
    if (value === null || value === undefined) {
      return null;
    }
    if (Array.isArray(value)) {
      return value.map(normalizeValue);
    }
    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.getTime();
      }
      const normalizedObj: Record<string, any> = {};
      const sortedKeys = Object.keys(value).sort();
      for (const key of sortedKeys) {
        if (key === '__typename') {
          continue;
        }
        normalizedObj[key] = normalizeValue(value[key]);
      }
      return normalizedObj;
    }
    return value;
  };

  for (const field of fieldsToCompare) {
    const cachedVal = normalizeValue(cachedRecord[field.name]);
    const newVal = normalizeValue(newRecord[field.name]);

    if (!isDeeplyEqual(cachedVal, newVal)) {
      return true;
    }
  }

  return false;
};
