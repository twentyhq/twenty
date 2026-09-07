import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryNumericFeature } from '@/polyfills/media-query/types/MediaQueryNumericFeature';
import { type MediaQueryRangeOperator } from '@/polyfills/media-query/types/MediaQueryRangeOperator';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { resolveMediaQueryRangeComparison } from '@/polyfills/media-query/utils/resolveMediaQueryRangeComparison';

type CreateMediaQueryRangeConditionInput = {
  feature: MediaQueryNumericFeature;
  operator: MediaQueryRangeOperator;
  isFeatureNameOnLeft: boolean;
  valueString: string;
};

export const createMediaQueryRangeCondition = ({
  feature,
  operator,
  isFeatureNameOnLeft,
  valueString,
}: CreateMediaQueryRangeConditionInput): ParsedMediaQueryCondition | null => {
  const value = feature.parseValue(valueString.trim());

  if (!isDefined(value)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: feature.source,
    comparison: resolveMediaQueryRangeComparison({
      operator,
      isFeatureNameOnLeft,
    }),
    value,
  };
};
