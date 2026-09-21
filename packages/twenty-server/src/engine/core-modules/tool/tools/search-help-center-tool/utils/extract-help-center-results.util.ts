import { isArray, isObject } from '@sniptt/guards';

export type HelpCenterResultsExtraction =
  | { isReadable: true; results: unknown[] }
  | { isReadable: false };

export const extractHelpCenterResults = (
  data: unknown,
): HelpCenterResultsExtraction => {
  if (isArray(data)) {
    return { isReadable: true, results: data };
  }

  if (isObject(data) && 'results' in data && isArray(data.results)) {
    return { isReadable: true, results: data.results };
  }

  return { isReadable: false };
};
