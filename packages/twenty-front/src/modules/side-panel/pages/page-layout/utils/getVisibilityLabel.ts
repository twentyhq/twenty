import { isDefined } from 'twenty-shared/utils';

import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';

export const getVisibilityLabel = (
  expression: string | null | undefined,
  labels: { anyDevice: string; mobile: string; desktop: string },
): string => {
  if (!isDefined(expression)) {
    return labels.anyDevice;
  }

  if (expression === EXPRESSION_DEVICE_MOBILE) {
    return labels.mobile;
  }

  if (expression === EXPRESSION_DEVICE_DESKTOP) {
    return labels.desktop;
  }

  return labels.anyDevice;
};
