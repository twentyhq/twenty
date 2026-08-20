import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';
import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';
import { areMediaQueryEnvironmentsEqual } from '@/polyfills/media-query/utils/areMediaQueryEnvironmentsEqual';

type CreateMediaQueryEnvironmentSourceInput = {
  geometryStore: WorkerGeometryStore;
  getColorScheme: () => MediaQueryEnvironment['colorScheme'];
  subscribeToColorSchemeUpdates: (listener: () => void) => () => void;
};

export const createMediaQueryEnvironmentSource = ({
  geometryStore,
  getColorScheme,
  subscribeToColorSchemeUpdates,
}: CreateMediaQueryEnvironmentSourceInput): MediaQueryEnvironmentSource => {
  const environmentUpdateListeners = new Set<MediaQueryEnvironmentListener>();

  const readEnvironment = (): MediaQueryEnvironment => {
    const viewportSnapshot = geometryStore.getViewportSnapshot();

    return {
      componentWidth: viewportSnapshot?.rootContainerClientWidth ?? 0,
      componentHeight: viewportSnapshot?.rootContainerClientHeight ?? 0,
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
      environmentUpdateListener(nextEnvironment);
    }
  };

  geometryStore.subscribeToViewportUpdates(handleUpstreamUpdate);
  subscribeToColorSchemeUpdates(handleUpstreamUpdate);

  return {
    readEnvironment,
    subscribeToEnvironmentUpdates: (
      listener: MediaQueryEnvironmentListener,
    ) => {
      if (environmentUpdateListeners.size === 0) {
        lastNotifiedEnvironment = readEnvironment();
      }

      environmentUpdateListeners.add(listener);

      return () => {
        environmentUpdateListeners.delete(listener);
      };
    },
  };
};
