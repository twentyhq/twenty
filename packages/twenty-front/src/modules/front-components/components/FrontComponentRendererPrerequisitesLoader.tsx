import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { FrontComponentLoadErrorToastEffect } from '@/front-components/components/FrontComponentLoadErrorToastEffect';
import { FrontComponentSourcesPreloadEffect } from '@/front-components/components/FrontComponentSourcesPreloadEffect';
import { FrontComponentRendererLoadingStatesResetEffect } from '@/front-components/components/FrontComponentRendererLoadingStatesResetEffect';
import { FrontComponentRendererPrerequisitesProvider } from '@/front-components/contexts/FrontComponentRendererPrerequisitesContext';
import { useFrontComponentSourceUrls } from '@/front-components/hooks/useFrontComponentSourceUrls';
import { frontComponentApplicationTokenPairLoadErrorComponentState } from '@/front-components/states/frontComponentApplicationTokenPairLoadErrorComponentState';
import { frontComponentInitialApplicationAccessTokenComponentState } from '@/front-components/states/frontComponentInitialApplicationAccessTokenComponentState';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { type FrontComponentFieldsNeededToStartLoading } from '@/front-components/types/FrontComponentFieldsNeededToStartLoading';
import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import { type ReactNode } from 'react';
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

  const frontComponentInitialApplicationAccessToken =
    useAtomComponentStateValue(
      frontComponentInitialApplicationAccessTokenComponentState,
    );
  const frontComponentApplicationTokenPairLoadError =
    useAtomComponentStateValue(
      frontComponentApplicationTokenPairLoadErrorComponentState,
    );
  const frontComponentSourcesPreload = useAtomComponentStateValue(
    frontComponentSourcesPreloadComponentState,
  );

  const {
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    hasSharedDependencies,
    isSdkClientReady,
  } = useFrontComponentSourceUrls(frontComponentFieldsNeededToStartLoading);

  const canStartFetchingSources =
    isDefined(frontComponentInitialApplicationAccessToken) && isSdkClientReady;
  const isReadyToRender =
    canStartFetchingSources && isDefined(frontComponentFromFindOneQuery);

  const doPreloadedSourcesMatchCurrentUrls =
    isDefined(frontComponentSourcesPreload) &&
    frontComponentSourcesPreload.componentUrl === componentUrl &&
    frontComponentSourcesPreload.sdkClientUrls === sdkClientUrls &&
    frontComponentSourcesPreload.sharedDependenciesUrl ===
      sharedDependenciesUrl;

  return (
    <>
      <FrontComponentRendererLoadingStatesResetEffect />
      <FrontComponentApplicationTokenPairEffect applicationId={applicationId} />
      <FrontComponentLoadErrorToastEffect
        errorMessage={frontComponentApplicationTokenPairLoadError?.message}
      />
      {canStartFetchingSources && !isReadyToRender && (
        <FrontComponentSourcesPreloadEffect
          componentUrl={componentUrl}
          sdkClientUrls={sdkClientUrls}
          sharedDependenciesUrl={sharedDependenciesUrl}
          applicationAccessToken={frontComponentInitialApplicationAccessToken}
          shouldPrefetchSdkClientSources={usesSdkClient}
          shouldPrefetchSharedDependenciesSource={hasSharedDependencies}
        />
      )}
      {isDefined(frontComponentApplicationTokenPairLoadError) &&
        unavailableFallback}
      {!isDefined(frontComponentApplicationTokenPairLoadError) &&
        !isReadyToRender &&
        loadingFallback}
      {isReadyToRender && (
        <FrontComponentRendererPrerequisitesProvider
          value={{
            frontComponent: frontComponentFromFindOneQuery,
            applicationAccessToken: frontComponentInitialApplicationAccessToken,
            componentUrl,
            sdkClientUrls,
            sharedDependenciesUrl,
            preloadedSourcesPromise: doPreloadedSourcesMatchCurrentUrls
              ? frontComponentSourcesPreload.sourcesPromise
              : undefined,
          }}
        >
          {children}
        </FrontComponentRendererPrerequisitesProvider>
      )}
    </>
  );
};
