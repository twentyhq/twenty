import { isDefined } from 'twenty-shared/utils';

// A readable payload that happens to be empty is a real answer -- the help
// center has nothing on that query. A payload in a shape we do not recognise
// is an operational failure, and collapsing both to `[]` would report the
// second as the first.
export type HelpCenterResultsExtraction =
  | { isReadable: true; results: unknown[] }
  | { isReadable: false };

// The help center search endpoint is not part of this repository and has
// answered with both a bare array and a `{ results: [...] }` envelope. Reading
// `.length` off whatever came back reported "Found undefined relevant help
// center articles" whenever it was not an array.
export const extractHelpCenterResults = (
  data: unknown,
): HelpCenterResultsExtraction => {
  if (Array.isArray(data)) {
    return { isReadable: true, results: data };
  }

  if (isDefined(data) && typeof data === 'object') {
    const { results } = data as { results?: unknown };

    if (Array.isArray(results)) {
      return { isReadable: true, results };
    }
  }

  return { isReadable: false };
};
