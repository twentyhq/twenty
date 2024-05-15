import snakeCase from 'lodash.snakecase';

import { OPTION_VALUE_VALID_STRING_PATTERN } from '~/pages/settings/data-model/utils/constants.utils';
import { formatLabelOrThrows } from '~/pages/settings/data-model/utils/format-label.util';

export const transliterateLabel = (label: string) =>
  formatLabelOrThrows(label, OPTION_VALUE_VALID_STRING_PATTERN);

export const getOptionValueFromLabel = (label: string) => {
  const transliteratedLabel = label;
  try {
    transliterateLabel(label);
  } catch (error) {
    return label;
  }

  return snakeCase(transliteratedLabel).toUpperCase();
};
