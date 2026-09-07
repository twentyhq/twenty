import { fastDeepEqual } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';

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
  const environmentUpdateListeners = new Set<() => void>();

  const readUpstreamEnvironment = (): MediaQueryEnvironment => {
    const viewportSnapshot = geometryStore.getViewportSnapshot();

    return {
      componentWidth: viewportSnapshot?.rootContainerClientWidth ?? 0,
      componentHeight: viewportSnapshot?.rootContainerClientHeight ?? 0,
      devicePixelRatio: viewportSnapshot?.devicePixelRatio ?? 1,
      colorScheme: getColorScheme(),
    };
  };

  let environment = readUpstreamEnvironment();

  const handleUpstreamUpdate = () => {
    const nextEnvironment = readUpstreamEnvironment();

    if (fastDeepEqual(nextEnvironment, environment)) {
      return;
    }

    environment = nextEnvironment;

    for (const environmentUpdateListener of [...environmentUpdateListeners]) {
      environmentUpdateListener();
    }
  };

  geometryStore.subscribeToGeometryUpdates(handleUpstreamUpdate);
  subscribeToColorSchemeUpdates(handleUpstreamUpdate);

  return {
    readEnvironment: () => environment,
    subscribeToEnvironmentUpdates: (listener) => {
      environmentUpdateListeners.add(listener);

      return () => {
        environmentUpdateListeners.delete(listener);
      };
    },
  };
};
