import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';

type CreateMediaQueryEnvironmentSourceInput = {
  geometryStore: WorkerGeometryStore;
  getColorScheme: () => MediaQueryEnvironment['colorScheme'];
  subscribeToColorSchemeUpdates: (listener: () => void) => () => void;
};

const areMediaQueryEnvironmentsEqual = (
  firstEnvironment: MediaQueryEnvironment,
  secondEnvironment: MediaQueryEnvironment,
): boolean =>
  firstEnvironment.viewportWidth === secondEnvironment.viewportWidth &&
  firstEnvironment.viewportHeight === secondEnvironment.viewportHeight &&
  firstEnvironment.devicePixelRatio === secondEnvironment.devicePixelRatio &&
  firstEnvironment.colorScheme === secondEnvironment.colorScheme;

export const createMediaQueryEnvironmentSource = ({
  geometryStore,
  getColorScheme,
  subscribeToColorSchemeUpdates,
}: CreateMediaQueryEnvironmentSourceInput): MediaQueryEnvironmentSource => {
  const environmentUpdateListeners = new Set<() => void>();

  const readEnvironment = (): MediaQueryEnvironment => {
    const viewportSnapshot = geometryStore.getViewportSnapshot();

    return {
      viewportWidth: viewportSnapshot?.innerWidth ?? 0,
      viewportHeight: viewportSnapshot?.innerHeight ?? 0,
      devicePixelRatio: viewportSnapshot?.devicePixelRatio ?? 1,
      colorScheme: getColorScheme(),
    };
  };

  let lastNotifiedEnvironment = readEnvironment();

  const handleUpstreamUpdate = () => {
    if (environmentUpdateListeners.size === 0) {
      return;
    }

    const nextEnvironment = readEnvironment();

    if (
      areMediaQueryEnvironmentsEqual(nextEnvironment, lastNotifiedEnvironment)
    ) {
      return;
    }

    lastNotifiedEnvironment = nextEnvironment;

    for (const environmentUpdateListener of [...environmentUpdateListeners]) {
      environmentUpdateListener();
    }
  };

  geometryStore.subscribeToViewportUpdates(handleUpstreamUpdate);
  subscribeToColorSchemeUpdates(handleUpstreamUpdate);

  return {
    readEnvironment,
    subscribeToEnvironmentUpdates: (listener: () => void) => {
      environmentUpdateListeners.add(listener);

      return () => {
        environmentUpdateListeners.delete(listener);
      };
    },
  };
};
