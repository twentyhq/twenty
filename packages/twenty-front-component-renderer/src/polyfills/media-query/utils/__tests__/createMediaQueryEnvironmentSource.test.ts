import { createMediaQueryEnvironmentFixture } from '@/testing/createMediaQueryEnvironmentFixture';
import { createSubscriptionStub } from '@/testing/createSubscriptionStub';
import { createWorkerGeometryStoreStub } from '@/testing/createWorkerGeometryStoreStub';
import { createViewportGeometrySnapshotFixture } from '@/testing/createViewportGeometrySnapshotFixture';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';
import { createMediaQueryEnvironmentSource } from '../createMediaQueryEnvironmentSource';

const setupEnvironmentSource = () => {
  let viewportSnapshot: ViewportGeometrySnapshot | null = null;
  let colorScheme: 'light' | 'dark' = 'light';

  const geometrySubscription = createSubscriptionStub();
  const colorSchemeSubscription = createSubscriptionStub();

  const geometryStore = createWorkerGeometryStoreStub({
    getViewportSnapshot: jest.fn(() => viewportSnapshot),
    subscribeToGeometryUpdates: geometrySubscription.subscribe,
  });

  const environmentSource = createMediaQueryEnvironmentSource({
    geometryStore,
    getColorScheme: () => colorScheme,
    subscribeToColorSchemeUpdates: colorSchemeSubscription.subscribe,
  });

  const pushViewportSnapshot = (
    overrides: Partial<ViewportGeometrySnapshot>,
  ) => {
    viewportSnapshot = createViewportGeometrySnapshotFixture({
      ...viewportSnapshot,
      ...overrides,
    });

    geometrySubscription.notify();
  };

  const notifyColorSchemeSource = colorSchemeSubscription.notify;

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

    expect(environmentSource.readEnvironment()).toEqual(
      createMediaQueryEnvironmentFixture(),
    );
  });

  it('should measure the component box rather than the host browser window', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();

    pushViewportSnapshot({
      innerWidth: 1440,
      innerHeight: 900,
      rootContainerClientWidth: 350,
      rootContainerClientHeight: 600,
    });

    expect(environmentSource.readEnvironment()).toEqual(
      createMediaQueryEnvironmentFixture({
        componentWidth: 350,
        componentHeight: 600,
      }),
    );
  });

  it('should notify on a component size change with the environment already updated', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn(() =>
      environmentSource.readEnvironment(),
    );

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    pushViewportSnapshot({ rootContainerClientWidth: 1024 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
    expect(environmentUpdateListener).toHaveReturnedWith(
      createMediaQueryEnvironmentFixture({ componentWidth: 1024 }),
    );
  });

  it('should not notify on scroll-only viewport updates', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    pushViewportSnapshot({ rootContainerClientWidth: 1024 });
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

  it('should notify when the environment reverts to a value cached while unobserved', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    pushViewportSnapshot({ rootContainerClientWidth: 1024 });

    environmentSource.subscribeToEnvironmentUpdates(environmentUpdateListener);

    pushViewportSnapshot({ rootContainerClientWidth: 0 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
  });

  it('should stop notifying after unsubscribe', () => {
    const { environmentSource, pushViewportSnapshot } =
      setupEnvironmentSource();
    const environmentUpdateListener = jest.fn();

    const unsubscribe = environmentSource.subscribeToEnvironmentUpdates(
      environmentUpdateListener,
    );

    pushViewportSnapshot({ rootContainerClientWidth: 1024 });
    unsubscribe();
    pushViewportSnapshot({ rootContainerClientWidth: 1200 });

    expect(environmentUpdateListener).toHaveBeenCalledTimes(1);
  });
});
