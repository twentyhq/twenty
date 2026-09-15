import { isDefined } from 'twenty-shared/utils';

// The help center search endpoint is not part of this repository and has
// answered with both a bare array and a `{ results: [...] }` envelope. Reading
// `.length` off whatever came back reported "Found undefined relevant help
// center articles" whenever it was not an array.
export const extractHelpCenterResults = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (isDefined(data) && typeof data === 'object') {
    const { results } = data as { results?: unknown };

    if (Array.isArray(results)) {
      return results;
    }
  }

  return [];
};
