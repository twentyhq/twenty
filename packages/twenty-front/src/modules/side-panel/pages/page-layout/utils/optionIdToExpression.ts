import { EXPRESSION_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceDesktop';
import { EXPRESSION_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ExpressionDeviceMobile';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';

export const optionIdToExpression = (optionId: string): string | null => {
  switch (optionId) {
    case VISIBILITY_MOBILE:
      return EXPRESSION_DEVICE_MOBILE;
    case VISIBILITY_DESKTOP:
      return EXPRESSION_DEVICE_DESKTOP;
    default:
      return null;
  }
};
