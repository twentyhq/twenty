import { FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentStorageMaxKeyLength';
import { FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentStorageMaxTotalLength';
import { FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentStorageMaxValueLength';

export const getFrontComponentStorageViolationMessage = ({
  key,
  serializedValue,
  otherEntriesTotalLength,
}: {
  key: string;
  serializedValue: string;
  otherEntriesTotalLength: number;
}): string | null => {
  if (key.length > FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH) {
    return `Storage keys cannot exceed ${FRONT_COMPONENT_STORAGE_MAX_KEY_LENGTH} characters`;
  }

  if (serializedValue.length > FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH) {
    return `Storage values cannot exceed ${FRONT_COMPONENT_STORAGE_MAX_VALUE_LENGTH} characters`;
  }

  if (
    otherEntriesTotalLength + key.length + serializedValue.length >
    FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH
  ) {
    return `Storage quota of ${FRONT_COMPONENT_STORAGE_MAX_TOTAL_LENGTH} characters exceeded`;
  }

  return null;
};
