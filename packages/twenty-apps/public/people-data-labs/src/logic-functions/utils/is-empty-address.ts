import { isObject } from '@sniptt/guards';

import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';

export const isEmptyAddress = (value: unknown): boolean => {
  if (!isObject(value)) {
    return true;
  }

  const record = value as Record<string, unknown>;

  return (
    isEmptyText(record.addressStreet1) &&
    isEmptyText(record.addressStreet2) &&
    isEmptyText(record.addressCity) &&
    isEmptyText(record.addressPostcode) &&
    isEmptyText(record.addressState) &&
    isEmptyText(record.addressCountry)
  );
};
