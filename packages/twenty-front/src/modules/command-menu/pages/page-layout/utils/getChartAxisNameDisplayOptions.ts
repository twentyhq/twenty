import { assertUnreachable } from 'twenty-shared/utils';
import { AxisNameDisplay } from '~/generated/graphql';

export const getChartAxisNameDisplayOptions = (option: AxisNameDisplay) => {
  switch (option) {
    case AxisNameDisplay.NONE:
      return 'None';
    case AxisNameDisplay.X:
      return 'X axis';
    case AxisNameDisplay.Y:
      return 'Y axis';
    case AxisNameDisplay.BOTH:
      return 'Both';
    default:
      assertUnreachable(option);
  }
};
