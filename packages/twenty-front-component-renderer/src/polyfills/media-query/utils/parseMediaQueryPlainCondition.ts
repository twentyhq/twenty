import { isDefined } from 'twenty-shared/utils';

import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryColorSchemeCondition } from '@/polyfills/media-query/utils/parseMediaQueryColorSchemeCondition';
import { parseMediaQueryNumericFeatureName } from '@/polyfills/media-query/utils/parseMediaQueryNumericFeatureName';
import { parseMediaQueryOrientationCondition } from '@/polyfills/media-query/utils/parseMediaQueryOrientationCondition';

type ParseMediaQueryPlainConditionInput = {
  featureName: string;
  featureValue: string;
};

export const parseMediaQueryPlainCondition = ({
  featureName,
  featureValue,
}: ParseMediaQueryPlainConditionInput): ParsedMediaQueryCondition | null => {
  if (featureName === 'prefers-color-scheme') {
    return parseMediaQueryColorSchemeCondition(featureValue);
  }

  if (featureName === 'orientation') {
    return parseMediaQueryOrientationCondition(featureValue);
  }

  const numericFeatureName = parseMediaQueryNumericFeatureName(featureName);

  if (!isDefined(numericFeatureName)) {
    return null;
  }

  const value = numericFeatureName.feature.parseValue(featureValue);

  if (!isDefined(value)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: numericFeatureName.feature.source,
    comparison: numericFeatureName.comparison,
    value,
  };
};
