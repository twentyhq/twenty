import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabelOrThrow';
import { sanitizeReservedKeyword } from '~/pages/settings/data-model/utils/sanitizeReservedKeyword';

export const computeMetadataNameFromLabel = (label: string): string => {
  try {
    const computedName = computeMetadataNameFromLabelOrThrow(label);
    return sanitizeReservedKeyword(computedName);
  } catch {
    return '';
  }
};
