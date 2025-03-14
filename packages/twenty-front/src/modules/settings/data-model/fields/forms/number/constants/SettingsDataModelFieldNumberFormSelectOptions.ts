import { t } from '@lingui/macro';
import { IconNumber9, IconPercentage } from 'twenty-ui';

export const SETTINGS_DATA_MODEL_FIELD_NUMBER_FORM_SELECT_OPTIONS = [
    {
      Icon: IconNumber9,
      label: t`Number`,
      value: 'number',
    },
    {
      Icon: IconPercentage,
      label: t`Percentage`,
      value: 'percentage',
    },
  ];