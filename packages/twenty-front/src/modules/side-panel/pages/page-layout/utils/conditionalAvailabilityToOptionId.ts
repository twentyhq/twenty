import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

import { CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ConditionalAvailabilityDeviceDesktop';
import { CONDITIONAL_AVAILABILITY_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ConditionalAvailabilityDeviceMobile';
import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const conditionalAvailabilityToOptionId = (
  conditionalAvailability: ConditionalAvailabilityNode | null | undefined,
): string => {
  if (
    isDeeplyEqual(
      conditionalAvailability,
      CONDITIONAL_AVAILABILITY_DEVICE_MOBILE,
      { strict: true },
    )
  ) {
    return VISIBILITY_MOBILE;
  }

  if (
    isDeeplyEqual(
      conditionalAvailability,
      CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP,
      { strict: true },
    )
  ) {
    return VISIBILITY_DESKTOP;
  }

  return VISIBILITY_ANY_DEVICE;
};
