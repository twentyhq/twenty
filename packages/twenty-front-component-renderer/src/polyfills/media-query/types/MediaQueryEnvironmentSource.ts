import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';

export type MediaQueryEnvironmentSource = {
  readEnvironment: () => MediaQueryEnvironment;
  subscribeToEnvironmentUpdates: (listener: () => void) => () => void;
};
