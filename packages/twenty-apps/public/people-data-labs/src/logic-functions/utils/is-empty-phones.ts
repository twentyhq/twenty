import { isObject } from '@sniptt/guards';

import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';

export const isEmptyPhones = (value: unknown): boolean => {
  if (!isObject(value)) {
    return true;
  }

  const record = value as Record<string, unknown>;

  return isEmptyText(record.primaryPhoneNumber);
};
