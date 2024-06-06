import { OPTION_VALUE_VALID_PATTERN } from '~/pages/settings/data-model/constants/OptionValueValidPattern';
import { transliterateAndFormatOrThrow } from '~/pages/settings/data-model/utils/transliterate-and-format.utils';

export const computeOptionValueFromLabelOrThrow = (label: string): string => {
  return transliterateAndFormatOrThrow(label, OPTION_VALUE_VALID_PATTERN);
};
