import { createWorkerGeometryStore } from '@/polyfills/geometry/utils/createWorkerGeometryStore';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { installMatchMediaPolyfill } from '../installMatchMediaPolyfill';

jest.mock('@remote-dom/core/elements', () => ({
  remoteId: () => '0',
}));

type MatchMediaFunction = (query: unknown) => WorkerMediaQueryList;

const setupMatchMedia = () => {
  const geometryStore = createWorkerGeometryStore();
  const colorSchemeListeners = new Set<() => void>();

  let colorScheme: 'light' | 'dark' = 'light';

  const globalScope: Record<string, unknown> = {};

  installMatchMediaPolyfill({
    globalScope,
    geometryStore,
    getColorScheme: () => colorScheme,
    subscribeToColorSchemeUpdates: (listener) => {
      colorSchemeListeners.add(listener);

      return () => {
        colorSchemeListeners.delete(listener);
      };
    },
  });

  const pushViewportWidth = (innerWidth: number) => {
    geometryStore.applyGeometryBatch({
      viewport: createViewportGeometrySnapshotFixture({
        innerWidth,
        innerHeight: 768,
        devicePixelRatio: 2,
      }),
    });
  };

  const setColorScheme = (nextColorScheme: 'light' | 'dark') => {
    colorScheme = nextColorScheme;

    for (const colorSchemeListener of colorSchemeListeners) {
      colorSchemeListener();
    }
  };

  return {
    matchMedia: globalScope.matchMedia as MatchMediaFunction,
    globalScope,
    pushViewportWidth,
    setColorScheme,
  };
};

describe('installMatchMediaPolyfill', () => {
  it('should evaluate min-width and max-width against the seeded viewport snapshot', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    expect(matchMedia('(min-width: 800px)').matches).toBe(true);
    expect(matchMedia('(min-width: 1024px)').matches).toBe(true);
    expect(matchMedia('(min-width: 1200px)').matches).toBe(false);
    expect(matchMedia('(max-width: 1024px)').matches).toBe(true);
    expect(matchMedia('(max-width: 1000px)').matches).toBe(false);
  });

  it('should evaluate combined and comma-separated queries', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

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

  it('should evaluate device pixel ratio queries against the snapshot', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    expect(matchMedia('(-webkit-min-device-pixel-ratio: 2)').matches).toBe(
      true,
    );
    expect(matchMedia('(min-resolution: 192dpi)').matches).toBe(true);
    expect(matchMedia('(min-resolution: 3dppx)').matches).toBe(false);
  });

  it('should report zero viewport sizes before the first push', () => {
    const { matchMedia } = setupMatchMedia();

    expect(matchMedia('(min-width: 1px)').matches).toBe(false);
    expect(matchMedia('(max-width: 100px)').matches).toBe(true);
  });

  it('should return false for unknown or unparseable queries without throwing', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

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

  it('should evaluate prefers-color-scheme from the color scheme source', () => {
    const { matchMedia, setColorScheme } = setupMatchMedia();

    expect(matchMedia('(prefers-color-scheme: light)').matches).toBe(true);
    expect(matchMedia('(prefers-color-scheme: dark)').matches).toBe(false);

    setColorScheme('dark');

    expect(matchMedia('(prefers-color-scheme: dark)').matches).toBe(true);
  });

  it('should dispatch a change event when the color scheme flips', () => {
    const { matchMedia, setColorScheme } = setupMatchMedia();
    const changeListener = jest.fn();

    const mediaQueryList = matchMedia('(prefers-color-scheme: dark)');
    mediaQueryList.addEventListener('change', changeListener);

    setColorScheme('dark');

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenCalledWith({
      type: 'change',
      media: '(prefers-color-scheme: dark)',
      matches: true,
    });
  });

  it('should notify a change listener exactly once per flip', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    const changeListener = jest.fn();
    const mediaQueryList = matchMedia('(min-width: 1000px)');
    mediaQueryList.addEventListener('change', changeListener);

    pushViewportWidth(800);
    pushViewportWidth(700);

    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(changeListener).toHaveBeenLastCalledWith({
      type: 'change',
      media: '(min-width: 1000px)',
      matches: false,
    });

    pushViewportWidth(1200);

    expect(changeListener).toHaveBeenCalledTimes(2);
    expect(changeListener).toHaveBeenLastCalledWith({
      type: 'change',
      media: '(min-width: 1000px)',
      matches: true,
    });
  });

  it('should stop notifying after removeEventListener', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    const changeListener = jest.fn();
    const mediaQueryList = matchMedia('(min-width: 1000px)');
    mediaQueryList.addEventListener('change', changeListener);
    mediaQueryList.removeEventListener('change', changeListener);

    pushViewportWidth(800);

    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should support the deprecated addListener and removeListener aliases', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    const changeListener = jest.fn();
    const mediaQueryList = matchMedia('(min-width: 1000px)');
    mediaQueryList.addListener(changeListener);

    pushViewportWidth(800);
    expect(changeListener).toHaveBeenCalledTimes(1);

    mediaQueryList.removeListener(changeListener);

    pushViewportWidth(1200);
    expect(changeListener).toHaveBeenCalledTimes(1);
  });

  it('should invoke and clear the onchange handler', () => {
    const { matchMedia, pushViewportWidth } = setupMatchMedia();
    pushViewportWidth(1024);

    const onchangeHandler = jest.fn();
    const mediaQueryList = matchMedia('(min-width: 1000px)');
    mediaQueryList.onchange = onchangeHandler;

    pushViewportWidth(800);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);

    mediaQueryList.onchange = null;

    pushViewportWidth(1200);
    expect(onchangeHandler).toHaveBeenCalledTimes(1);
  });

  it('should install matchMedia on both the global scope and a distinct window', () => {
    const polyfillWindow: Record<string, unknown> = {};
    const globalScope: Record<string, unknown> = { window: polyfillWindow };
    const geometryStore = createWorkerGeometryStore();

    installMatchMediaPolyfill({
      globalScope,
      geometryStore,
      getColorScheme: () => 'light',
      subscribeToColorSchemeUpdates: () => () => {},
    });

    expect(typeof globalScope.matchMedia).toBe('function');
    expect(globalScope.matchMedia).toBe(polyfillWindow.matchMedia);
  });
});
