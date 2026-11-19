import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { optionIdToConditionalAvailability } from '@/side-panel/pages/page-layout/utils/optionIdToConditionalAvailability';

export const getWidgetVisibilityUpdate = (
  optionId: string,
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
  conditionalAvailability: optionIdToConditionalAvailability(optionId),
});
