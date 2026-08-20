import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { createWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';
import { evaluateParsedMediaQueryList } from '@/polyfills/media-query/utils/evaluateParsedMediaQueryList';
import { parseMediaQueryList } from '@/polyfills/media-query/utils/parseMediaQueryList';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallMatchMediaPolyfillInput = {
  globalScope: Record<string, unknown>;
  environmentSource: MediaQueryEnvironmentSource;
};

export const installMatchMediaPolyfill = ({
  globalScope,
  environmentSource,
}: InstallMatchMediaPolyfillInput): void => {
  const matchMedia = (mediaQuery: unknown): WorkerMediaQueryList => {
    const media = String(mediaQuery);
    const parsedMediaQueryList = parseMediaQueryList(media);

    return createWorkerMediaQueryList({
      media,
      readEnvironment: environmentSource.readEnvironment,
      evaluateMatches: (environment) =>
        evaluateParsedMediaQueryList({ parsedMediaQueryList, environment }),
      subscribeToEnvironmentUpdates:
        environmentSource.subscribeToEnvironmentUpdates,
    });
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.matchMedia = matchMedia;
  }
};
