import { isDefined } from 'twenty-shared/utils';

import { splitAvailabilityExpression } from '@/page-layout/utils/splitAvailabilityExpression';
import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';

export const getVisibilityLabel = (
  expression: string | null | undefined,
  labels: { anyDevice: string; mobile: string; desktop: string },
): string => {
  const { viewerCondition } = splitAvailabilityExpression(expression);

  if (!isDefined(viewerCondition)) {
    return labels.anyDevice;
  }

  if (viewerCondition === EXPRESSION_DEVICE_MOBILE) {
    return labels.mobile;
  }

  if (viewerCondition === EXPRESSION_DEVICE_DESKTOP) {
    return labels.desktop;
  }

  return labels.anyDevice;
};
