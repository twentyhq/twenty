import { stripEmptyValues } from './strip-empty-values.util';

export const compactToolOutput = (output: unknown): unknown => {
  if (!output || typeof output !== 'object') {
    return output;
  }

  return stripEmptyValues(output);
};
