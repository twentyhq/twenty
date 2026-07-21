import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

type InstallWindowGeometryPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
};

export const installWindowGeometryPolyfill = ({
  globalScope,
  geometryStore,
}: InstallWindowGeometryPolyfillInput): void => {
  const polyfillWindow = globalScope.window;

  const installTargets: object[] = [globalScope];

  if (
    isDefined(polyfillWindow) &&
    typeof polyfillWindow === 'object' &&
    polyfillWindow !== globalScope
  ) {
    installTargets.push(polyfillWindow);
  }

  const defineViewportGetter = (
    propertyName: 'innerWidth' | 'innerHeight' | 'devicePixelRatio',
    readFromViewport: (viewport: ViewportGeometrySnapshot) => number,
    fallbackValue: number,
  ): void => {
    for (const installTarget of installTargets) {
      Object.defineProperty(installTarget, propertyName, {
        get() {
          const viewport = geometryStore.getViewportSnapshot();

          return isDefined(viewport)
            ? readFromViewport(viewport)
            : fallbackValue;
        },
        configurable: true,
      });
    }
  };

  defineViewportGetter('innerWidth', (viewport) => viewport.innerWidth, 0);
  defineViewportGetter('innerHeight', (viewport) => viewport.innerHeight, 0);
  defineViewportGetter(
    'devicePixelRatio',
    (viewport) => viewport.devicePixelRatio,
    1,
  );
};
