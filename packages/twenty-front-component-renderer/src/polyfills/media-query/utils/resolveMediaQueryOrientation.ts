import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryOrientation } from '@/polyfills/media-query/types/MediaQueryOrientation';

export const resolveMediaQueryOrientation = (
  environment: MediaQueryEnvironment,
): MediaQueryOrientation =>
  environment.componentHeight >= environment.componentWidth
    ? 'portrait'
    : 'landscape';
