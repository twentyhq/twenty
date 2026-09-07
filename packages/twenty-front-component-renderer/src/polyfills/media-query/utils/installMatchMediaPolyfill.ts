import { type MediaQueryEnvironmentSource } from '@/polyfills/media-query/types/MediaQueryEnvironmentSource';
import { type WorkerMediaQueryList } from '@/polyfills/media-query/types/WorkerMediaQueryList';
import { createWorkerMediaQueryList } from '@/polyfills/media-query/utils/createWorkerMediaQueryList';
import { evaluateParsedMediaQuery } from '@/polyfills/media-query/utils/evaluateParsedMediaQuery';
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

  const reportListenerError = (error: unknown): void => {
    reportErrorToPolyfillWindow({ polyfillWindow, error });
  };

  const matchMedia = (mediaQuery: unknown): WorkerMediaQueryList => {
    const media = String(mediaQuery);
    const parsedMediaQueryList = parseMediaQueryList(media);

    return createWorkerMediaQueryList({
      media,
      evaluateMatches: () => {
        const environment = environmentSource.readEnvironment();

        return parsedMediaQueryList.some((parsedMediaQuery) =>
          evaluateParsedMediaQuery({ parsedMediaQuery, environment }),
        );
      },
      subscribeToEnvironmentUpdates:
        environmentSource.subscribeToEnvironmentUpdates,
      reportListenerError,
    });
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.matchMedia = matchMedia;
  }
};
