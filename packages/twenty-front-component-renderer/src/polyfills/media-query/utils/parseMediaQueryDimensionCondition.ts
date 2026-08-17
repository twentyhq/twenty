import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryLengthToPixels } from '@/polyfills/media-query/utils/parseMediaQueryLengthToPixels';

type ParseMediaQueryDimensionConditionInput = {
  dimension: 'width' | 'height';
  comparison: MediaQueryComparison;
  featureValue: string;
};

export const parseMediaQueryDimensionCondition = ({
  dimension,
  comparison,
  featureValue,
}: ParseMediaQueryDimensionConditionInput): ParsedMediaQueryCondition | null => {
  const valueInPixels = parseMediaQueryLengthToPixels(featureValue);

  if (!isDefined(valueInPixels)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: dimension === 'width' ? 'viewportWidth' : 'viewportHeight',
    comparison,
    value: valueInPixels,
  };
};
