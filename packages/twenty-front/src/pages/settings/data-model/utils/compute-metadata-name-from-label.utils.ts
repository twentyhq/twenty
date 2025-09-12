import { computeMetadataNameFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label-or-throw.utils';

export const computeMetadataNameFromLabel = (label: string): string => {
  let metadataName = '';
  try {
    metadataName = computeMetadataNameFromLabelOrThrow(label);
  } catch {
    /* empty */
  }
  return metadataName;
};
