import { useEffect } from 'react';
import {
  fetchFrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

import { logError } from '~/utils/logError';
import { frontComponentSourcesPreloadComponentState } from '@/front-components/states/frontComponentSourcesPreloadComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

type FrontComponentSourcesPreloadEffectProps = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  applicationAccessToken: string;
  shouldPrefetchSdkClientSources: boolean;
  shouldPrefetchSharedDependenciesSource: boolean;
};

export const FrontComponentSourcesPreloadEffect = ({
  componentUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  applicationAccessToken,
  shouldPrefetchSdkClientSources,
  shouldPrefetchSharedDependenciesSource,
}: FrontComponentSourcesPreloadEffectProps) => {
  const setFrontComponentSourcesPreload = useSetAtomComponentState(
    frontComponentSourcesPreloadComponentState,
  );

  useEffect(() => {
    const fetchSourcesOrUndefinedOnFailure = async () => {
      try {
        return await fetchFrontComponentSources({
          componentUrl,
          sdkClientUrls,
          sharedDependenciesUrl,
          applicationAccessToken,
          shouldPrefetchSdkClientSources,
          shouldPrefetchSharedDependenciesSource,
        });
      } catch (error) {
        logError(error);

        return undefined;
      }
    };

    setFrontComponentSourcesPreload({
      componentUrl,
      sdkClientUrls,
      sharedDependenciesUrl,
      sourcesPromise: fetchSourcesOrUndefinedOnFailure(),
    });
  }, [
    componentUrl,
    sdkClientUrls,
    sharedDependenciesUrl,
    applicationAccessToken,
    shouldPrefetchSdkClientSources,
    shouldPrefetchSharedDependenciesSource,
    setFrontComponentSourcesPreload,
  ]);

  return null;
};
