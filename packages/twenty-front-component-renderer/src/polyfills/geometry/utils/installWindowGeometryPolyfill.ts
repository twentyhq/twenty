import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

type InstallWindowGeometryPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
};

export const installWindowGeometryPolyfill = ({
  globalScope,
  geometryStore,
}: InstallWindowGeometryPolyfillInput): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);

  const defineViewportGetter = (
    propertyName:
      | 'innerWidth'
      | 'innerHeight'
      | 'devicePixelRatio'
      | 'scrollX'
      | 'scrollY'
      | 'pageXOffset'
      | 'pageYOffset',
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
  defineViewportGetter('scrollX', (viewport) => viewport.scrollX, 0);
  defineViewportGetter('scrollY', (viewport) => viewport.scrollY, 0);
  defineViewportGetter('pageXOffset', (viewport) => viewport.scrollX, 0);
  defineViewportGetter('pageYOffset', (viewport) => viewport.scrollY, 0);
};
