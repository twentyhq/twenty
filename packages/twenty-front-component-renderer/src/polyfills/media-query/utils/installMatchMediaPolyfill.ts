import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { createWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';
import { evaluateParsedMediaQueryList } from '@/polyfills/media-query/utils/evaluateParsedMediaQueryList';
import { parseMediaQueryList } from '@/polyfills/media-query/utils/parseMediaQueryList';
import { reportErrorToPolyfillWindow } from '@/polyfills/utils/reportErrorToPolyfillWindow';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { resolvePolyfillWindow } from '@/polyfills/utils/resolvePolyfillWindow';

type InstallMatchMediaPolyfillInput = {
  globalScope: Record<string, unknown>;
  environmentSource: MediaQueryEnvironmentSource;
};

export const installMatchMediaPolyfill = ({
  globalScope,
  environmentSource,
}: InstallMatchMediaPolyfillInput): void => {
  const polyfillWindow = resolvePolyfillWindow(globalScope);

  const matchMedia = (mediaQuery: unknown): WorkerMediaQueryList => {
    const media = String(mediaQuery);
    const parsedMediaQueryList = parseMediaQueryList(media);

    return createWorkerMediaQueryList({
      media,
      evaluateMatches: () =>
        evaluateParsedMediaQueryList({
          parsedMediaQueryList,
          environment: environmentSource.readEnvironment(),
        }),
      subscribeToEnvironmentUpdates:
        environmentSource.subscribeToEnvironmentUpdates,
      reportListenerError: (error) =>
        reportErrorToPolyfillWindow({ polyfillWindow, error }),
    });
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.matchMedia = matchMedia;
  }
};
