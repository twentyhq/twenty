import { isDefined } from 'twenty-shared/utils';

import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';
import { parseMediaQueryResolutionToDevicePixelRatio } from '@/polyfills/media-query/utils/parseMediaQueryResolutionToDevicePixelRatio';

type ParseMediaQueryResolutionConditionInput = {
  comparison: MediaQueryComparison;
  featureValue: string;
};

export const parseMediaQueryResolutionCondition = ({
  comparison,
  featureValue,
}: ParseMediaQueryResolutionConditionInput): ParsedMediaQueryCondition | null => {
  const valueInDevicePixelRatio =
    parseMediaQueryResolutionToDevicePixelRatio(featureValue);

  if (!isDefined(valueInDevicePixelRatio)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: 'devicePixelRatio',
    comparison,
    value: valueInDevicePixelRatio,
  };
};
