import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { VISIBILITY_DESKTOP } from '@/side-panel/pages/page-layout/constants/VisibilityDesktop';
import { VISIBILITY_MOBILE } from '@/side-panel/pages/page-layout/constants/VisibilityMobile';
import { buildDeviceConditionalAvailability } from 'twenty-shared/conditional-availability';

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
      conditionalAvailability: buildDeviceConditionalAvailability('MOBILE'),
    };
  }

  if (visibilityOptionId === VISIBILITY_DESKTOP) {
    return {
      ...clearedLegacyVisibilityRules,
      conditionalAvailability: buildDeviceConditionalAvailability('DESKTOP'),
    };
  }

  return { ...clearedLegacyVisibilityRules, conditionalAvailability: null };
};
