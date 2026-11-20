import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsDesktopConditionalAvailability';
import { DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY } from '@/side-panel/pages/page-layout/constants/DeviceIsMobileConditionalAvailability';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';

export const getWidgetVisibilityPropertiesFromOptionId = (
  visibilityOptionId: string,
): Required<
  Pick<
    PageLayoutWidget,
    | 'conditionalAvailabilityExpression'
    | 'conditionalDisplay'
    | 'conditionalAvailability'
  >
> => {
  const clearedLegacyVisibilityRules = {
    conditionalAvailabilityExpression: null,
    conditionalDisplay: null,
  };

  if (visibilityOptionId === VISIBILITY_MOBILE) {
    return {
      ...clearedLegacyVisibilityRules,
      conditionalAvailability: DEVICE_IS_MOBILE_CONDITIONAL_AVAILABILITY,
    };
  }

  if (visibilityOptionId === VISIBILITY_DESKTOP) {
    return {
      ...clearedLegacyVisibilityRules,
      conditionalAvailability: DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY,
    };
  }

  return { ...clearedLegacyVisibilityRules, conditionalAvailability: null };
};
