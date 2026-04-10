import jsonLogic, { type RulesLogic } from 'json-logic-js';
import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type EvaluateWidgetVisibilityParams = {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: RulesLogic | undefined;
  context: WidgetVisibilityContext;
};

export const evaluateWidgetVisibility = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
  context,
}: EvaluateWidgetVisibilityParams): boolean => {
  if (isDefined(conditionalAvailabilityExpression)) {
    return evaluateConditionalAvailabilityExpression(
      conditionalAvailabilityExpression,
      context,
    );
  }

  if (!isDefined(conditionalDisplay)) {
    return true;
  }

  const isVisible = jsonLogic.apply(conditionalDisplay, context) === true;

  return isVisible;
};
