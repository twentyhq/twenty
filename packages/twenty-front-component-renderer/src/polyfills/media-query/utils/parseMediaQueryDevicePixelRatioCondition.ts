import { type MediaQueryComparison } from '@/polyfills/media-query/types/MediaQueryComparison';
import { type ParsedMediaQueryCondition } from '@/polyfills/media-query/types/ParsedMediaQueryCondition';

const DEVICE_PIXEL_RATIO_VALUE_PATTERN = /^(\d+(\.\d+)?|\.\d+)$/;

type ParseMediaQueryDevicePixelRatioConditionInput = {
  comparison: MediaQueryComparison;
  featureValue: string;
};

export const parseMediaQueryDevicePixelRatioCondition = ({
  comparison,
  featureValue,
}: ParseMediaQueryDevicePixelRatioConditionInput): ParsedMediaQueryCondition | null => {
  if (!DEVICE_PIXEL_RATIO_VALUE_PATTERN.test(featureValue)) {
    return null;
  }

  return {
    kind: 'numeric',
    source: 'devicePixelRatio',
    comparison,
    value: Number(featureValue),
  };
};
