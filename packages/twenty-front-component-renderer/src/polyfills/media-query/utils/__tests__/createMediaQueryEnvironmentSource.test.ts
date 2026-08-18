import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';
import { createMediaQueryEnvironmentSource } from '../createMediaQueryEnvironmentSource';

const setupEnvironmentSource = () => {
  let viewportSnapshot: ViewportGeometrySnapshot | null = null;
  let colorScheme: 'light' | 'dark' = 'light';

  const viewportUpdateListeners = new Set<() => void>();
  const colorSchemeSourceListeners = new Set<() => void>();

  const geometryStore = createWorkerGeometryStoreStub({
    getViewportSnapshot: jest.fn(() => viewportSnapshot),
    subscribeToViewportUpdates: jest.fn((listener: () => void) => {
      viewportUpdateListeners.add(listener);

      return () => {
        viewportUpdateListeners.delete(listener);
      };
    }),
  });

  const environmentSource = createMediaQueryEnvironmentSource({
    geometryStore,
    getColorScheme: () => colorScheme,
    subscribeToColorSchemeUpdates: (listener) => {
      colorSchemeSourceListeners.add(listener);

      return () => {
        colorSchemeSourceListeners.delete(listener);
      };
    },
  });

  const pushViewportSnapshot = (
    overrides: Partial<ViewportGeometrySnapshot>,
  ) => {
    viewportSnapshot = createViewportGeometrySnapshotFixture({
      ...viewportSnapshot,
      ...overrides,
    });

    for (const viewportUpdateListener of viewportUpdateListeners) {
      viewportUpdateListener();
    }
  };

  const notifyColorSchemeSource = () => {
    for (const colorSchemeSourceListener of colorSchemeSourceListeners) {
      colorSchemeSourceListener();
    }
  };

  const setColorScheme = (nextColorScheme: 'light' | 'dark') => {
    colorScheme = nextColorScheme;
    notifyColorSchemeSource();
  };

  return {
    environmentSource,
    pushViewportSnapshot,
    setColorScheme,
    notifyColorSchemeSource,
  };
};

describe('createMediaQueryEnvironmentSource', () => {
  it('should read zeroed defaults before the first viewport snapshot', () => {
    const { environmentSource } = setupEnvironmentSource();

    expect(environmentSource.readEnvironment()).toEqual({
      viewportWidth: 0,
      viewportHeight: 0,
      devicePixelRatio: 1,
      colorScheme: 'light',
    });
  });

  it('should notify on a viewport size change', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    pushViewportSnapshot({ innerWidth: 1024 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
    expect(environmentSource.readEnvironment().viewportWidth).toBe(1024);
  });

  it('should not notify on scroll-only viewport updates', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    pushViewportSnapshot({ innerWidth: 1024 });
    pushViewportSnapshot({ scrollY: 200 });
    pushViewportSnapshot({ scrollY: 400, rootContainerY: 50 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
  });

  it('should not notify on color scheme source updates that keep the scheme', () => {
    const { environmentSource, notifyColorSchemeSource } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    notifyColorSchemeSource();
    notifyColorSchemeSource();

    expect(environmentUpdateListener).not.toHaveBeenCalled();
  });

  it('should notify once per color scheme change', () => {
    const { environmentSource, setColorScheme } = setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    setColorScheme('dark');
    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);

    setColorScheme('dark');
    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);

    setColorScheme('light');
    expect(environmentUpdateListener).toHaveBeenCalledTimes(2);
  });

  it('should stop notifying after unsubscribe', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    const unsubscribe = environmentSource.subscribeToEnvironmentUpdates(
      environmentUpdateListener,
    );

    pushViewportSnapshot({ innerWidth: 1024 });
    unsubscribe();
    pushViewportSnapshot({ innerWidth: 1200 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
  });
});
