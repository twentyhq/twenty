import { DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsDesktopConditionalAvailability';
import { DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsMobileConditionalAvailability';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export const getConditionalAvailabilityFromVisibilityOptionId = (
  visibilityOptionId: string,
): ConditionalAvailabilityNode | null => {
  switch (visibilityOptionId) {
    case VISIBILITY_MOBILE:
      return DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY;
    case VISIBILITY_DESKTOP:
      return DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY;
    default:
      return null;
  }
};
