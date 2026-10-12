import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { createResizeObserverClass } from '@/polyfills/geometry/utils/createResizeObserverClass';
import { resolvePolyfillHooks } from '@/polyfills/dom/utils/resolvePolyfillHooks';
import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';

type InstallResizeObserverPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
  documentTarget: { body?: unknown; documentElement?: unknown };
};

export const installResizeObserverPolyfill = ({
  globalScope,
  geometryStore,
  documentTarget,
}: InstallResizeObserverPolyfillInput): void => {
  const installTargets = resolveGlobalScopeInstallTargets(globalScope);
  const polyfillWindow = resolvePolyfillWindow(globalScope);
  const ResizeObserverImplementation = createResizeObserverClass({
    geometryStore,
    documentTarget,
    hooks: resolvePolyfillHooks(installTargets),
    reportCallbackError: (error) =>
      reportErrorToPolyfillWindow({ polyfillWindow, error }),
  });

  for (const installTarget of installTargets) {
    Object.defineProperty(installTarget, 'ResizeObserver', {
      value: ResizeObserverImplementation,
      configurable: true,
      writable: true,
    });
  }
};
