import { splitAvailabilityExpression } from '@/page-layout/utils/splitAvailabilityExpression';
import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';
import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';

export const expressionToOptionId = (
  expression: string | null | undefined,
): string => {
  const { viewerCondition } = splitAvailabilityExpression(expression);

  if (!viewerCondition) {
    return VISIBILITY_ANY_DEVICE;
  }

  if (viewerCondition === EXPRESSION_DEVICE_MOBILE) {
    return VISIBILITY_MOBILE;
  }

  if (viewerCondition === EXPRESSION_DEVICE_DESKTOP) {
    return VISIBILITY_DESKTOP;
  }

  return VISIBILITY_ANY_DEVICE;
};
