import { isFeatureFlagOnlyAvailabilityExpression } from '@/page-layout/utils/isFeatureFlagOnlyAvailabilityExpression';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// The shape replaceViewerConditionInAvailabilityExpression writes.
const FEATURE_FLAG_AND_VIEWER_CONDITIONS_PATTERN = /^\((.+?)\) and \((.+)\)$/;

export type AvailabilityExpressionParts = {
  featureFlagCondition: string | null;
  viewerCondition: string | null;
};

export const splitAvailabilityExpression = (
  expression: string | null | undefined,
): AvailabilityExpressionParts => {
  if (!isNonEmptyString(expression)) {
    return { featureFlagCondition: null, viewerCondition: null };
  }

  if (isFeatureFlagOnlyAvailabilityExpression(expression)) {
    return { featureFlagCondition: expression, viewerCondition: null };
  }

  const match = expression.match(FEATURE_FLAG_AND_VIEWER_CONDITIONS_PATTERN);

  if (isDefined(match) && isFeatureFlagOnlyAvailabilityExpression(match[1])) {
    return { featureFlagCondition: match[1], viewerCondition: match[2] };
  }

  return { featureFlagCondition: null, viewerCondition: expression };
};
