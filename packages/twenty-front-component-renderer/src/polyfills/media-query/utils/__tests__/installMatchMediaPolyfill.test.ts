import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { installMatchMediaPolyfill } from '../installMatchMediaPolyfill';

type MatchMediaFunction = (query: unknown) => WorkerMediaQueryList;

const setupMatchMedia = () => {
  let environment: MediaQueryEnvironment = {
    viewportWidth: 0,
    viewportHeight: 0,
    devicePixelRatio: 1,
    colorScheme: 'light',
  };

  const environmentUpdateListeners = new Set<() => void>();

  const globalScope: Record<string, unknown> = {};

  installMatchMediaPolyfill({
    globalScope,
    environmentSource: {
      readEnvironment: () => environment,
      subscribeToEnvironmentUpdates: (listener) => {
        environmentUpdateListeners.add(listener);

        return () => {
          environmentUpdateListeners.delete(listener);
        };
      },
    },
  });

  const setEnvironment = (overrides: Partial<MediaQueryEnvironment>) => {
    environment = { ...environment, ...overrides };

    for (const environmentUpdateListener of environmentUpdateListeners) {
      environmentUpdateListener();
    }
  };

  return {
    matchMedia: globalScope.matchMedia as MatchMediaFunction,
    globalScope,
    setEnvironment,
  };
};

describe('installMatchMediaPolyfill', () => {
  it('should evaluate min-width and max-width against the environment', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    setEnvironment({ viewportWidth: 1024 });

    expect(matchMedia('(min-width: 800px)').matches).toBe(true);
    expect(matchMedia('(min-width: 1024px)').matches).toBe(true);
    expect(matchMedia('(min-width: 1200px)').matches).toBe(false);
    expect(matchMedia('(max-width: 1024px)').matches).toBe(true);
    expect(matchMedia('(max-width: 1000px)').matches).toBe(false);
  });

  it('should evaluate combined and comma-separated queries', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    setEnvironment({ viewportWidth: 1024 });

    expect(
      matchMedia('screen and (min-width: 800px) and (max-width: 1200px)')
        .matches,
    ).toBe(true);
    expect(matchMedia('(min-width: 2000px), (max-width: 1100px)').matches).toBe(
      true,
    );
    expect(matchMedia('print').matches).toBe(false);
    expect(matchMedia('not print').matches).toBe(true);
  });

  it('should evaluate device pixel ratio queries against the environment', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    setEnvironment({ devicePixelRatio: 2 });

    expect(matchMedia('(-webkit-min-device-pixel-ratio: 2)').matches).toBe(
      true,
    );
    expect(matchMedia('(min-resolution: 192dpi)').matches).toBe(true);
    expect(matchMedia('(min-resolution: 3dppx)').matches).toBe(false);
  });

  it('should report zero viewport sizes before the first environment update', () => {
    const { matchMedia } = setupMatchMedia();

    expect(matchMedia('(min-width: 1px)').matches).toBe(false);
    expect(matchMedia('(max-width: 100px)').matches).toBe(true);
  });

  it('should return false for unknown or unparseable queries without throwing', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    setEnvironment({ viewportWidth: 1024 });

    expect(matchMedia('(orientation: portrait)').matches).toBe(false);
    expect(matchMedia('(min-width >= 600px)').matches).toBe(false);
    expect(matchMedia('garbage').matches).toBe(false);
    expect(matchMedia(undefined).matches).toBe(false);
    expect(matchMedia('garbage').media).toBe('garbage');
  });

  it('should match the empty query like the all media type', () => {
    const { matchMedia } = setupMatchMedia();

    expect(matchMedia('').matches).toBe(true);
    expect(matchMedia('all').matches).toBe(true);
  });

  it('should evaluate prefers-color-scheme from the environment', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();

    expect(matchMedia('(prefers-color-scheme: light)').matches).toBe(true);
    expect(matchMedia('(prefers-color-scheme: dark)').matches).toBe(false);

    setEnvironment({ colorScheme: 'dark' });

    expect(matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  });

  it('should dispatch a change event when the color scheme flips', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    const changeListener = jest.fn();

    const mediaQueryList = matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.addEventListener('change', changeListener);

    setEnvironment({ colorScheme: 'dark' });

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenCalledWith({
      type: 'change',
      media: '(prefers-color-scheme: dark)',
      matches: true,
    });
  });

  it('should notify a change listener exactly once per flip', () => {
    const { matchMedia, setEnvironment } = setupMatchMedia();
    setEnvironment({ viewportWidth: 1024 });

    const changeListener = jest.fn();
    const mediaQueryList = matchMedia('(min-width: 1000px)');
    mediaQueryList.addEventListener('change', changeListener);

    setEnvironment({ viewportWidth: 800 });
    setEnvironment({ viewportWidth: 700 });

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenLastCalledWith({
      type: 'change',
      media: '(min-width: 1000px)',
      matches: false,
    });

    setEnvironment({ viewportWidth: 1200 });

    expect(changeListener).toHaveBeenCalledTimes(2);
    expect(changeListener).toHaveBeenLastCalledWith({
      type: 'change',
      media: '(min-width: 1000px)',
      matches: true,
    });
  });

  it('should install matchMedia on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };

    installMatchMediaPolyfill({
      globalScope,
      environmentSource: {
        readEnvironment: () => ({
          viewportWidth: 0,
          viewportHeight: 0,
          devicePixelRatio: 1,
          colorScheme: 'light',
        }),
        subscribeToEnvironmentUpdates: () => () => {},
      },
    });

    expect(typeof globalScope.matchMedia).toBe('function');
    expect(globalScope.matchMedia).toBe(polyfillWindow.matchMedia);
  });
});
