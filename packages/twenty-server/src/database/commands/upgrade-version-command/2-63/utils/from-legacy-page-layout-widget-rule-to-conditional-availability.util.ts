import { isNonEmptyString } from '@sniptt/guards';
import {
  type ConditionalEvaluationNode,
  parseConditionalEvaluationExpression,
  validateConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';

import { fromLegacyJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-json-logic-to-conditional-availability.util';

type LegacyPageLayoutWidgetRuleConversion =
  | { isValid: true; node: ConditionalEvaluationNode | null }
  | { isValid: false; errorMessage: string };

export const fromLegacyPageLayoutWidgetRuleToConditionalAvailability = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: unknown;
}): LegacyPageLayoutWidgetRuleConversion => {
  if (isNonEmptyString(conditionalAvailabilityExpression)) {
    return parseConditionalEvaluationExpression({
      expression: conditionalAvailabilityExpression,
      metadataName: 'pageLayoutWidget',
    });
  }

  if (!isDefined(conditionalDisplay)) {
    return { isValid: true, node: null };
  }

  const node = fromLegacyJsonLogicToConditionalAvailability(conditionalDisplay);

  if (!isDefined(node)) {
    return {
      isValid: false,
      errorMessage: 'The json-logic rule uses a form the tree cannot express',
    };
  }

  const validationResult = validateConditionalEvaluationNode({
    node,
    metadataName: 'pageLayoutWidget',
  });

  if (!validationResult.isValid) {
    return { isValid: false, errorMessage: validationResult.errorMessage };
  }

  return { isValid: true, node };
};
