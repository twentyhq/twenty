import { workerGeometryStore } from '@/polyfills/geometry/states/workerGeometryStore';
import { createMediaQueryEnvironmentSource } from '@/polyfills/media-query/utils/createMediaQueryEnvironmentSource';
import { getFrontComponentColorScheme } from '@/remote/worker/environment/utils/getFrontComponentColorScheme';
import { subscribeToFrontComponentExecutionContextUpdates } from '@/remote/worker/environment/utils/subscribeToFrontComponentExecutionContextUpdates';

export const mediaQueryEnvironmentSource = createMediaQueryEnvironmentSource({
  geometryStore: workerGeometryStore,
  getColorScheme: getFrontComponentColorScheme,
  subscribeToColorSchemeUpdates:
    subscribeToFrontComponentExecutionContextUpdates,
});
