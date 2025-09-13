import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/computeMetadataNameFromLabelOrThrow';

export const computeMetadataNameFromLabel = (label: string): string => {
  try {
    return computeMetadataNameFromLabelOrThrow(label);
  } catch {
    return '';
  }
};
