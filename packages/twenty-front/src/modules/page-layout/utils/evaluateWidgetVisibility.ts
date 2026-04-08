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
    const res = evaluateConditionalAvailabilityExpression(
      conditionalAvailabilityExpression,
      context,
    );

    console.log('Evaluating conditional availability expression:', {
      conditionalAvailabilityExpression,
      context,
      willShow: res,
    });

    return res;
  }

  if (!isDefined(conditionalDisplay)) {
    return true;
  }

  const isVisible = jsonLogic.apply(conditionalDisplay, context) === true;

  return isVisible;
};
