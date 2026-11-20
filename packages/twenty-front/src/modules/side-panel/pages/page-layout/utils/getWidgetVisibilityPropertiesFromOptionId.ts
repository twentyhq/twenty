import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getConditionalAvailabilityFromVisibilityOptionId } from '@/side-panel/pages/page-layout/utils/getConditionalAvailabilityFromVisibilityOptionId';

export const getWidgetVisibilityPropertiesFromOptionId = (
  visibilityOptionId: string,
): Required<
  Pick<
    PageLayoutWidget,
    | 'conditionalAvailabilityExpression'
    | 'conditionalDisplay'
    | 'conditionalAvailability'
  >
> => ({
  conditionalAvailabilityExpression: null,
  conditionalDisplay: null,
  conditionalAvailability:
    getConditionalAvailabilityFromVisibilityOptionId(visibilityOptionId),
});
