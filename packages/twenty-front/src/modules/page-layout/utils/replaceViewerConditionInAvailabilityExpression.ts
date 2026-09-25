import { splitAvailabilityExpression } from '@/page-layout/utils/splitAvailabilityExpression';
import { isDefined } from 'twenty-shared/utils';

type ReplaceViewerConditionInAvailabilityExpressionParams = {
  expression: string | null | undefined;
  viewerCondition: string | null;
};

// Visibility settings pick who sees a widget; the feature flag condition a
// layout ships with has to outlive that choice.
export const replaceViewerConditionInAvailabilityExpression = ({
  expression,
  viewerCondition,
}: ReplaceViewerConditionInAvailabilityExpressionParams): string | null => {
  const { featureFlagCondition } = splitAvailabilityExpression(expression);

  if (!isDefined(featureFlagCondition)) {
    return viewerCondition;
  }

  if (!isDefined(viewerCondition)) {
    return featureFlagCondition;
  }

  return `(${featureFlagCondition}) and (${viewerCondition})`;
};
