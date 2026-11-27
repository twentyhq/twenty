// TODO(@neo773): the text and json-logic branches serve widgets not converted yet; drop them one release after stored rules are converted to trees
import jsonLogic, {
  type AdditionalOperation,
  type RulesLogic,
} from 'json-logic-js';
import {
  type ConditionalEvaluationNode,
  evaluateConditionalEvaluationExpression,
  evaluateConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';

type EvaluateWidgetVisibilityParams = {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: RulesLogic<AdditionalOperation> | undefined;
  conditionalAvailability?: ConditionalEvaluationNode | null;
  context: WidgetVisibilityContext;
  fields?: ValidationRuleFieldDescriptor[];
};

export const evaluateWidgetVisibility = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
  conditionalAvailability,
  context,
  fields,
}: EvaluateWidgetVisibilityParams): boolean => {
  if (isDefined(conditionalAvailabilityExpression)) {
    return evaluateConditionalEvaluationExpression(
      conditionalAvailabilityExpression,
      context,
    );
  }

  if (!isDefined(conditionalDisplay)) {
    const [targetRecord] = context.selectedRecords;

    return evaluateConditionalEvaluationNode({
      node: conditionalAvailability,
      context,
      record: targetRecord,
      fields,
    });
  }

  const isVisible = jsonLogic.apply(conditionalDisplay, context) === true;

  return isVisible;
};
