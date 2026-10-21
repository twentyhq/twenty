import { type MediaQueryNumericFeature } from '@/polyfills/media-query/types/MediaQueryNumericFeature';
import { parseMediaQueryDevicePixelRatioValue } from '@/polyfills/media-query/utils/parseMediaQueryDevicePixelRatioValue';
import { parseMediaQueryLengthToPixels } from '@/polyfills/media-query/utils/parseMediaQueryLengthToPixels';
import { parseMediaQueryResolutionToDevicePixelRatio } from '@/polyfills/media-query/utils/parseMediaQueryResolutionToDevicePixelRatio';

export const MEDIA_QUERY_NUMERIC_FEATURES = new Map<
  string,
  MediaQueryNumericFeature
>([
  [
    'width',
    { source: 'componentWidth', parseValue: parseMediaQueryLengthToPixels },
  ],
  [
    'height',
    { source: 'componentHeight', parseValue: parseMediaQueryLengthToPixels },
  ],
  [
    'device-pixel-ratio',
    {
      source: 'devicePixelRatio',
      parseValue: parseMediaQueryDevicePixelRatioValue,
    },
  ],
  [
    'resolution',
    {
      source: 'devicePixelRatio',
      parseValue: parseMediaQueryResolutionToDevicePixelRatio,
    },
  ],
]);
