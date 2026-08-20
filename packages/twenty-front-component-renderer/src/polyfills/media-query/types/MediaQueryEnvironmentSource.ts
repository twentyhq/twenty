import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';

export type MediaQueryEnvironmentSource = {
  readEnvironment: () => MediaQueryEnvironment;
  subscribeToEnvironmentUpdates: (
    listener: MediaQueryEnvironmentListener,
  ) => () => void;
};
