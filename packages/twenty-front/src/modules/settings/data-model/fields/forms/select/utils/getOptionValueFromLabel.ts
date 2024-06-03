import snakeCase from 'lodash.snakecase';

import { computeOptionValueFromLabelOrThrow } from '~/pages/settings/data-model/utils/compute-option-value-from-label.utils';

export const getOptionValueFromLabel = (label: string) => {
  let transliteratedLabel = label;
  try {
    transliteratedLabel = computeOptionValueFromLabelOrThrow(label);
  } catch (error) {
    return label;
  }

  return snakeCase(transliteratedLabel).toUpperCase();
};
