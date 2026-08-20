import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';

export const areMediaQueryEnvironmentsEqual = (
  firstEnvironment: MediaQueryEnvironment,
  secondEnvironment: MediaQueryEnvironment,
): boolean =>
  firstEnvironment.componentWidth === secondEnvironment.componentWidth &&
  firstEnvironment.componentHeight === secondEnvironment.componentHeight &&
  firstEnvironment.devicePixelRatio === secondEnvironment.devicePixelRatio &&
  firstEnvironment.colorScheme === secondEnvironment.colorScheme;
