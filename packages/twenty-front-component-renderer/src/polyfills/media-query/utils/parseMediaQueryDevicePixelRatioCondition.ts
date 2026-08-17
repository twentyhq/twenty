import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

type ParseMediaQueryDevicePixelRatioConditionInput = {
  comparison: MediaQueryComparison;
  featureValue: string;
};

export const parseMediaQueryDevicePixelRatioCondition = ({
  comparison,
  featureValue,
}: ParseMediaQueryDevicePixelRatioConditionInput): ParsedMediaQueryCondition | null => {
  if (!/^(\d+(\.\d+)?|\.\d+)$/.test(featureValue)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: 'devicePixelRatio',
    comparison,
    value: Number(featureValue),
  };
};
