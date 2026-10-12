import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveFrontComponentPortalArea } from '@/polyfills/geometry/utils/resolveFrontComponentPortalArea';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallVisualViewportPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
};

export const installVisualViewportPolyfill = ({
  globalScope,
  geometryStore,
}: InstallVisualViewportPolyfillInput): void => {
  const visualViewport = new EventTarget();
  const readPortalArea = () =>
    resolveFrontComponentPortalArea(geometryStore.getViewportSnapshot());

  Object.defineProperties(visualViewport, {
    offsetLeft: { get: () => readPortalArea().x },
    offsetTop: { get: () => readPortalArea().y },
    pageLeft: {
      get: () =>
        readPortalArea().x +
        (geometryStore.getViewportSnapshot()?.scrollX ?? 0),
    },
    pageTop: {
      get: () =>
        readPortalArea().y +
        (geometryStore.getViewportSnapshot()?.scrollY ?? 0),
    },
    width: { get: () => readPortalArea().width },
    height: { get: () => readPortalArea().height },
    scale: { value: 1 },
  });

  let previousPortalArea = readPortalArea();

  const dispatchGeometryChangeToViewportListeners = (): void => {
    const portalArea = readPortalArea();
    const hasPortalAreaResized =
      portalArea.width !== previousPortalArea.width ||
      portalArea.height !== previousPortalArea.height;

    previousPortalArea = portalArea;
    visualViewport.dispatchEvent(
      new Event(hasPortalAreaResized ? 'resize' : 'scroll'),
    );
  };

  geometryStore.subscribeToGeometryUpdates(
    dispatchGeometryChangeToViewportListeners,
  );

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    Object.defineProperty(installTarget, 'visualViewport', {
      value: visualViewport,
      configurable: true,
    });
  }
};
