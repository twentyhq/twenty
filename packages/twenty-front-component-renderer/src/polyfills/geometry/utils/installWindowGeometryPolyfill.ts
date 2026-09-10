import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const VIEWPORT_VALUE_READERS: Record<
  string,
  (viewport: ViewportGeometrySnapshot | null) => number
> = {
  innerWidth: (viewport) => viewport?.innerWidth ?? 0,
  innerHeight: (viewport) => viewport?.innerHeight ?? 0,
  devicePixelRatio: (viewport) => viewport?.devicePixelRatio ?? 1,
  scrollX: (viewport) => viewport?.scrollX ?? 0,
  scrollY: (viewport) => viewport?.scrollY ?? 0,
};

type InstallWindowGeometryPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
};

export const installWindowGeometryPolyfill = ({
  globalScope,
  geometryStore,
}: InstallWindowGeometryPolyfillInput): void => {
  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [propertyName, readViewportValue] of Object.entries(
      VIEWPORT_VALUE_READERS,
    )) {
      Object.defineProperty(installTarget, propertyName, {
        get: () => readViewportValue(geometryStore.getViewportSnapshot()),
        configurable: true,
      });
    }
  }
};
