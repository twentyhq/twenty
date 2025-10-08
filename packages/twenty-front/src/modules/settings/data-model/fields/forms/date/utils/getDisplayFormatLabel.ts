import { DateDisplayFormat } from 'twenty-shared/types';
import { t } from '@lingui/core/macro';

export const getDisplayFormatLabel = (displayFormat: DateDisplayFormat) => {
  switch (displayFormat) {
    case DateDisplayFormat.CUSTOM:
      return t`Custom`;
    case DateDisplayFormat.RELATIVE:
      return t`Relative`;
    case DateDisplayFormat.USER_SETTINGS:
      return t`Default`;
    default:
      return '';
  }
};
