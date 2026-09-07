import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryBooleanCondition } from '@/polyfills/media-query/utils/parseMediaQueryBooleanCondition';
import { parseMediaQueryPlainCondition } from '@/polyfills/media-query/utils/parseMediaQueryPlainCondition';
import { parseMediaQueryRangeCondition } from '@/polyfills/media-query/utils/parseMediaQueryRangeCondition';

const CONDITION_WRAPPING_PARENTHESES_PATTERN = /^\(([\s\S]*)\)$/;

export const parseMediaQueryCondition = (
  conditionString: string,
): ParsedMediaQueryCondition[] | null => {
  const conditionMatch = conditionString.match(
    CONDITION_WRAPPING_PARENTHESES_PATTERN,
  );

  if (!isDefined(conditionMatch)) {
    return null;
  }

  const conditionContent = conditionMatch[1].trim();
  const colonIndex = conditionContent.indexOf(':');
  const hasFeatureNameValueSeparator = colonIndex !== -1;

  if (!hasFeatureNameValueSeparator) {
    const booleanCondition = parseMediaQueryBooleanCondition(conditionContent);

    if (isDefined(booleanCondition)) {
      return [booleanCondition];
    }

    return parseMediaQueryRangeCondition(conditionContent);
  }

  const featureName = conditionContent.slice(0, colonIndex).trim();
  const featureValue = conditionContent.slice(colonIndex + 1).trim();

  if (!isNonEmptyString(featureName) || !isNonEmptyString(featureValue)) {
    return null;
  }

  const plainCondition = parseMediaQueryPlainCondition({
    featureName,
    featureValue,
  });

  return isDefined(plainCondition) ? [plainCondition] : null;
};
