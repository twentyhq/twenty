// TODO(@neo773): the text and json-logic branches serve widgets not converted yet; drop them one release after stored rules are converted to trees
import jsonLogic, {
  type AdditionalOperation,
  type RulesLogic,
} from 'json-logic-js';
import {
  type ConditionalAvailabilityNode,
  evaluateConditionalAvailabilityExpression,
  evaluateConditionalAvailabilityNode,
} from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type EvaluateWidgetVisibilityParams = {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: RulesLogic<AdditionalOperation> | undefined;
  conditionalAvailability?: ConditionalAvailabilityNode | null;
  context: WidgetVisibilityContext;
};

export const evaluateWidgetVisibility = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
  conditionalAvailability,
  context,
}: EvaluateWidgetVisibilityParams): boolean => {
  if (isDefined(conditionalAvailabilityExpression)) {
    return evaluateConditionalAvailabilityExpression(
      conditionalAvailabilityExpression,
      context,
    );
  }

  if (!isDefined(conditionalDisplay)) {
    return evaluateConditionalAvailabilityNode({
      node: conditionalAvailability,
      context,
    });
  }

  const isVisible = jsonLogic.apply(conditionalDisplay, context) === true;

  return isVisible;
};
