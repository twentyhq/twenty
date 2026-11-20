// TODO(@neo773): stop reading the text rule once stored widget rules are converted to trees
import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { conditionalAvailabilityToOptionId } from '@/side-panel/pages/page-layout/utils/conditionalAvailabilityToOptionId';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';

export const getWidgetVisibilityOptionId = (
  widget:
    | Pick<
        PageLayoutWidget,
        'conditionalAvailabilityExpression' | 'conditionalAvailability'
      >
    | undefined,
): string => {
  if (isDefined(widget?.conditionalAvailabilityExpression)) {
    return expressionToOptionId(widget.conditionalAvailabilityExpression);
  }

  return conditionalAvailabilityToOptionId(widget?.conditionalAvailability);
};
