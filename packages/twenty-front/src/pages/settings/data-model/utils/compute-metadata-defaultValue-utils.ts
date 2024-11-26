import { applySimpleQuotesToStringRecursive } from '~/utils/string/applySimpleQuotesToString';
export const computeMetadataDefaultValue = (input: any): any => {
  if (typeof input !== 'object') {
    return input;
  }
  return applySimpleQuotesToStringRecursive(input);
};
