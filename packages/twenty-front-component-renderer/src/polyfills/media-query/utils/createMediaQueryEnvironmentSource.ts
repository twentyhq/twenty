import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentListener } from '@/polyfills/media-query/types/MediaQueryEnvironmentListener';
import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';
import { arePrimitiveRecordsEqual } from '@/utils/arePrimitiveRecordsEqual';

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

  let lastEnvironment = readEnvironment();

  const handleUpstreamUpdate = () => {
    const nextEnvironment = readEnvironment();

    if (arePrimitiveRecordsEqual(nextEnvironment, lastEnvironment)) {
      return;
    }

    lastEnvironment = nextEnvironment;

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
      environmentUpdateListeners.add(listener);

      return () => {
        environmentUpdateListeners.delete(listener);
      };
    },
  };
};
