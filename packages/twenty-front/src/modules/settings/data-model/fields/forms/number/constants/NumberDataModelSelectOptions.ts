import { msg } from '@lingui/core/macro';
import { IconNumber9, IconPercentage } from 'twenty-ui/display';

export const NUMBER_DATA_MODEL_SELECT_OPTIONS = [
  {
    Icon: IconNumber9,
    label: msg`Number`,
    value: 'number',
  },
  {
    Icon: IconPercentage,
    label: msg`Percentage`,
    value: 'percentage',
  },
];
