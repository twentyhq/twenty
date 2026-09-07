import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';

export const createMediaQueryEnvironmentFixture = (
  overrides: Partial<MediaQueryEnvironment> = {},
): MediaQueryEnvironment => ({
  componentWidth: 0,
  componentHeight: 0,
  devicePixelRatio: 1,
  colorScheme: 'light',
  ...overrides,
});
