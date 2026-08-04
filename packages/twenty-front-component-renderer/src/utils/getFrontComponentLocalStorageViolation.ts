import { type FrontComponentStorageErrorCode } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentLocalStorageMaxKeyLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentLocalStorageMaxTotalLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentLocalStorageMaxValueLength';

export const getFrontComponentLocalStorageViolation = ({
  key,
  serializedValue,
  otherEntriesTotalLength,
}: {
  key: string;
  serializedValue: string;
  otherEntriesTotalLength: number;
}): FrontComponentStorageErrorCode | null => {
  if (key.length > FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH) {
    return 'FRONT_COMPONENT_STORAGE_KEY_TOO_LONG';
  }

  if (serializedValue.length > FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH) {
    return 'FRONT_COMPONENT_STORAGE_VALUE_TOO_LARGE';
  }

  if (
    otherEntriesTotalLength + serializedValue.length >
    FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH
  ) {
    return 'FRONT_COMPONENT_STORAGE_QUOTA_EXCEEDED';
  }

  return null;
};
