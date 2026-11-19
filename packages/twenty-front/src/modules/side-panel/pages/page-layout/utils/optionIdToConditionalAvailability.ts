import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

import { CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP } from '@/side-panel/pages/page-layout/constants/ConditionalAvailabilityDeviceDesktop';
import { CONDITIONAL_AVAILABILITY_DEVICE_MOBILE } from '@/side-panel/pages/page-layout/constants/ConditionalAvailabilityDeviceMobile';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';

export const optionIdToConditionalAvailability = (
  optionId: string,
): ConditionalAvailabilityNode | null => {
  switch (optionId) {
    case VISIBILITY_MOBILE:
      return CONDITIONAL_AVAILABILITY_DEVICE_MOBILE;
    case VISIBILITY_DESKTOP:
      return CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP;
    default:
      return null;
  }
};
