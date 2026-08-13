import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type MediaQueryEnvironment } from '@/polyfills/media-query/types/MediaQueryEnvironment';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { createWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';
import { evaluateParsedMediaQueryList } from '@/polyfills/media-query/utils/evaluateParsedMediaQueryList';
import { parseMediaQueryList } from '@/polyfills/media-query/utils/parseMediaQueryList';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallMatchMediaPolyfillInput = {
  globalScope: Record<string, unknown>;
  geometryStore: WorkerGeometryStore;
  getColorScheme: () => MediaQueryEnvironment['colorScheme'];
  subscribeToColorSchemeUpdates: (listener: () => void) => () => void;
};

export const installMatchMediaPolyfill = ({
  globalScope,
  geometryStore,
  getColorScheme,
  subscribeToColorSchemeUpdates,
}: InstallMatchMediaPolyfillInput): void => {
  const environmentUpdateListeners = new Set<() => void>();

  const notifyEnvironmentUpdateListeners = () => {
    for (const environmentUpdateListener of [...environmentUpdateListeners]) {
      environmentUpdateListener();
    }
  };

  geometryStore.subscribeToViewportUpdates(notifyEnvironmentUpdateListeners);
  subscribeToColorSchemeUpdates(notifyEnvironmentUpdateListeners);

  const subscribeToEnvironmentUpdates = (
    listener: () => void,
  ): (() => void) => {
    environmentUpdateListeners.add(listener);

    return () => {
      environmentUpdateListeners.delete(listener);
    };
  };

  const readMediaQueryEnvironment = (): MediaQueryEnvironment => {
    const viewportSnapshot = geometryStore.getViewportSnapshot();

    return {
      viewportWidth: viewportSnapshot?.innerWidth ?? 0,
      viewportHeight: viewportSnapshot?.innerHeight ?? 0,
      devicePixelRatio: viewportSnapshot?.devicePixelRatio ?? 1,
      colorScheme: getColorScheme(),
    };
  };

  const matchMedia = (mediaQuery: unknown): WorkerMediaQueryList => {
    const media = String(mediaQuery);
    const parsedMediaQueryList = parseMediaQueryList(media);

    return createWorkerMediaQueryList({
      media,
      evaluateMatches: () =>
        evaluateParsedMediaQueryList(
          parsedMediaQueryList,
          readMediaQueryEnvironment(),
        ),
      subscribeToEnvironmentUpdates,
    });
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.matchMedia = matchMedia;
  }
};
