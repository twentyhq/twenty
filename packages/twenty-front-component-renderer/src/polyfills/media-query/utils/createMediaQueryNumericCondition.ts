import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryComparisonOperator } from '@/polyfills/media-query/types/MediaQueryComparisonOperator';
import { type MediaQueryNumericFeature } from '@/polyfills/media-query/types/MediaQueryNumericFeature';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

type CreateMediaQueryNumericConditionInput = {
  feature: MediaQueryNumericFeature;
  operator: MediaQueryComparisonOperator;
  valueString: string;
};

export const createMediaQueryNumericCondition = ({
  feature,
  operator,
  valueString,
}: CreateMediaQueryNumericConditionInput): ParsedMediaQueryCondition | null => {
  const value = feature.parseValue(valueString);

  if (!isDefined(value)) {
    return null;
  }

  return { kind: 'numeric', source: feature.source, operator, value };
};
