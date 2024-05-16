import { METADATA_NAME_VALID_PATTERN } from '~/pages/settings/data-model/constants/MetadataNameValidPattern';
import { transliterateAndFormatOrThrow } from '~/pages/settings/data-model/utils/transliterate-and-format.utils';

export const computeMetadataNameFromLabelOrThrow = (label: string): string => {
  return transliterateAndFormatOrThrow(label, METADATA_NAME_VALID_PATTERN);
};
