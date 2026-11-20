import { DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsDesktopConditionalAvailability';
import { DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsMobileConditionalAvailability';
import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export const getVisibilityOptionIdFromConditionalAvailability = (
  conditionalAvailability: ConditionalAvailabilityNode | null | undefined,
): string => {
  if (
    isDeeplyEqual(
      conditionalAvailability,
      DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY,
      { strict: true },
    )
  ) {
    return VISIBILITY_MOBILE;
  }

  if (
    isDeeplyEqual(
      conditionalAvailability,
      DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY,
      { strict: true },
    )
  ) {
    return VISIBILITY_DESKTOP;
  }

  return VISIBILITY_ANY_DEVICE;
};
