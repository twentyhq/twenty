import { VISIBILITY_ANY_DEVICE } from '@/side-panel/pages/page-layout/constants/VisibilityAnyDevice';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  buildDeviceConditionalAvailability,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';

export const getVisibilityOptionIdFromConditionalAvailability = (
  conditionalAvailability: ConditionalAvailabilityNode | null | undefined,
): string => {
  if (
    isDeeplyEqual(
      conditionalAvailability,
      buildDeviceConditionalAvailability('MOBILE'),
      { strict: true },
    )
  ) {
    return VISIBILITY_MOBILE;
  }

  if (
    isDeeplyEqual(
      conditionalAvailability,
      buildDeviceConditionalAvailability('DESKTOP'),
      { strict: true },
    )
  ) {
    return VISIBILITY_DESKTOP;
  }

  return VISIBILITY_ANY_DEVICE;
};
