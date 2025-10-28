import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';
import { AxisNameDisplay } from '~/generated/graphql';

export const getChartAxisNameDisplayOptions = (option: AxisNameDisplay) => {
  switch (option) {
    case AxisNameDisplay.NONE:
      return t`None`;
    case AxisNameDisplay.X:
      return t`X axis`;
    case AxisNameDisplay.Y:
      return t`Y axis`;
    case AxisNameDisplay.BOTH:
      return t`Both`;
    default:
      assertUnreachable(option);
  }
};
