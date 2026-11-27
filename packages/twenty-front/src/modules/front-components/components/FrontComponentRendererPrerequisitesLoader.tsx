import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { FrontComponentSourcesPreloadEffect } from '@/front-components/components/FrontComponentSourcesPreloadEffect';
import { FrontComponentRendererPrerequisitesProvider } from '@/front-components/contexts/FrontComponentRendererPrerequisitesContext';
import { useFrontComponentSourceUrls } from '@/front-components/hooks/useFrontComponentSourceUrls';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import { type FrontComponentFieldsNeededToStartLoading } from '@/front-components/types/FrontComponentFieldsNeededToStartLoading';
import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';
import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import { type ReactNode, useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FrontComponentRendererPrerequisitesLoaderProps = {
  frontComponentFieldsNeededToStartLoading: FrontComponentFieldsNeededToStartLoading;
  frontComponentFromFindOneQuery?: ResolvedFrontComponent;
  loadingFallback?: ReactNode;
  unavailableFallback?: ReactNode;
  children: ReactNode;
};

export const FrontComponentRendererPrerequisitesLoader = ({
  frontComponentFieldsNeededToStartLoading,
  frontComponentFromFindOneQuery,
  loadingFallback,
  unavailableFallback,
  children,
}: FrontComponentRendererPrerequisitesLoaderProps) => {
  const { applicationId, usesSdkClient } =
    frontComponentFieldsNeededToStartLoading;

  const [initialApplicationTokenPair, setInitialApplicationTokenPair] =
    useState<FrontComponentApplicationTokenPair | null>(null);
  const [applicationTokenPairLoadError, setApplicationTokenPairLoadError] =
    useState<Error | null>(null);
  const [sourcesPreload, setSourcesPreload] =
    useState<FrontComponentSourcesPreload | null>(null);

  const handleApplicationTokenPairLoaded = useCallback(
    (loadedApplicationTokenPair: FrontComponentApplicationTokenPair) => {
      setInitialApplicationTokenPair(
        (currentApplicationTokenPair) =>
          currentApplicationTokenPair ?? loadedApplicationTokenPair,
      );
    },
    [],
  );

  const {
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    hasSharedDependencies,
    isSdkClientReady,
  } = useFrontComponentSourceUrls(frontComponentFieldsNeededToStartLoading);

  const canStartFetchingSources =
    isDefined(initialApplicationTokenPair) && isSdkClientReady;
  const isReadyToRender =
    canStartFetchingSources && isDefined(frontComponentFromFindOneQuery);

  const doPreloadedSourcesMatchCurrentUrls =
    isDefined(sourcesPreload) &&
    sourcesPreload.componentUrl === componentUrl &&
    sourcesPreload.sdkClientUrls === sdkClientUrls &&
    sourcesPreload.sharedDependenciesUrl === sharedDependenciesUrl;

  return (
    <>
      <FrontComponentApplicationTokenPairEffect
        applicationId={applicationId}
        onApplicationTokenPairLoaded={handleApplicationTokenPairLoaded}
        onApplicationTokenPairLoadFailed={setApplicationTokenPairLoadError}
      />
      <FrontComponentLoadErrorToastEffect
        errorMessage={applicationTokenPairLoadError?.message}
      />
      {canStartFetchingSources &&
        !isReadyToRender &&
        !doPreloadedSourcesMatchCurrentUrls && (
          <FrontComponentSourcesPreloadEffect
            componentUrl={componentUrl}
            sdkClientUrls={sdkClientUrls}
            sharedDependenciesUrl={sharedDependenciesUrl}
            applicationAccessToken={
              initialApplicationTokenPair.applicationAccessToken.token
            }
            shouldPrefetchSdkClientSources={usesSdkClient}
            shouldPrefetchSharedDependenciesSource={hasSharedDependencies}
            onSourcesPreloadStarted={setSourcesPreload}
          />
        )}
      {isDefined(applicationTokenPairLoadError) && unavailableFallback}
      {!isDefined(applicationTokenPairLoadError) &&
        !isReadyToRender &&
        loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererPrerequisitesProvider
          value={{
            frontComponent: frontComponentFromFindOneQuery,
            applicationAccessToken:
              initialApplicationTokenPair.applicationAccessToken.token,
            componentUrl,
            sdkClientUrls,
            sharedDependenciesUrl,
            hasSharedDependencies,
            preloadedSourcesPromise: doPreloadedSourcesMatchCurrentUrls
              ? sourcesPreload.sourcesPromise
              : undefined,
          }}
        >
          {children}
        </FrontComponentRendererPrerequisitesProvider>
      )}
    </>
  );
};
