import jsonLogic, { type RulesLogic } from 'json-logic-js';

import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type EvaluateWidgetVisibilityParams = {
  conditionalDisplay: RulesLogic | undefined;
  context: WidgetVisibilityContext;
};

export const evaluateWidgetVisibility = ({
  conditionalDisplay,
  context,
}: EvaluateWidgetVisibilityParams): boolean => {
  if (!conditionalDisplay) {
    return true;
  }

  const isVisible = jsonLogic.apply(conditionalDisplay, context) === true;

  return isVisible;
};
