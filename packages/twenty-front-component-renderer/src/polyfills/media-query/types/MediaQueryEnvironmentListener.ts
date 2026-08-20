import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';

export type MediaQueryEnvironmentListener = (
  environment: MediaQueryEnvironment,
) => void;
