import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

const computeJsonHash = (value: unknown): string => {
  return createHash('md5').update(JSON.stringify(value)).digest('hex');
};

export const hasJsonChanged = (
  oldValue: unknown,
  newValue: unknown,
): boolean => {
  if (!isDefined(oldValue)) return isDefined(newValue);
  if (!isDefined(newValue)) return isDefined(oldValue);

  return computeJsonHash(oldValue) !== computeJsonHash(newValue);
};
