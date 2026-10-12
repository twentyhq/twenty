import { isDefined } from 'twenty-shared/utils';

export const isLocaleCatalog = (
  value: unknown,
): value is Record<string, string> =>
  isDefined(value) &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value).every((translation) => typeof translation === 'string');
