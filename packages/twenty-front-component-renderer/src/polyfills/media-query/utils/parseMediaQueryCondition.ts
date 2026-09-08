import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryBooleanCondition } from '@/polyfills/media-query/utils/parseMediaQueryBooleanCondition';
import { parseMediaQueryPlainCondition } from '@/polyfills/media-query/utils/parseMediaQueryPlainCondition';
import { parseMediaQueryRangeCondition } from '@/polyfills/media-query/utils/parseMediaQueryRangeCondition';
import { trimCssWhitespace } from '@/polyfills/media-query/utils/trimCssWhitespace';

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

  const conditionContent = trimCssWhitespace(conditionMatch[1]);
  const colonIndex = conditionContent.indexOf(':');
  const hasFeatureNameValueSeparator = colonIndex !== -1;

  if (!hasFeatureNameValueSeparator) {
    return (
      parseMediaQueryBooleanCondition(conditionContent) ??
      parseMediaQueryRangeCondition(conditionContent)
    );
  }

  const featureName = trimCssWhitespace(conditionContent.slice(0, colonIndex));
  const featureValue = trimCssWhitespace(
    conditionContent.slice(colonIndex + 1),
  );

  if (!isNonEmptyString(featureName) || !isNonEmptyString(featureValue)) {
    return null;
  }

  const plainCondition = parseMediaQueryPlainCondition({
    featureName,
    featureValue,
  });

  return isDefined(plainCondition) ? [plainCondition] : null;
};
