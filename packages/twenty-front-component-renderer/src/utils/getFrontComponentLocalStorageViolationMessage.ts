import { type FrontComponentStorageErrorCode } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH } from '@/constants/FrontComponentLocalStorageMaxKeyLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH } from '@/constants/FrontComponentLocalStorageMaxTotalLength';
import { FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH } from '@/constants/FrontComponentLocalStorageMaxValueLength';

export const getFrontComponentLocalStorageViolationMessage = (
  violation: FrontComponentStorageErrorCode,
): string => {
  switch (violation) {
    case 'FRONT_COMPONENT_STORAGE_KEY_TOO_LONG':
      return `Storage keys cannot exceed ${FRONT_COMPONENT_LOCAL_STORAGE_MAX_KEY_LENGTH} characters`;
    case 'FRONT_COMPONENT_STORAGE_VALUE_TOO_LARGE':
      return `Storage values cannot exceed ${FRONT_COMPONENT_LOCAL_STORAGE_MAX_VALUE_LENGTH} characters`;
    case 'FRONT_COMPONENT_STORAGE_QUOTA_EXCEEDED':
      return `Storage quota of ${FRONT_COMPONENT_LOCAL_STORAGE_MAX_TOTAL_LENGTH} characters exceeded`;
    case 'FRONT_COMPONENT_STORAGE_UNAVAILABLE':
      return 'Storage is unavailable';
  }
};
