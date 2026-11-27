import { useEffect } from 'react';
import {
  fetchFrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

import { logError } from '~/utils/logError';
import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';

type FrontComponentSourcesPreloadEffectProps = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  applicationAccessToken: string;
  shouldPrefetchSdkClientSources: boolean;
  shouldPrefetchSharedDependenciesSource: boolean;
  onSourcesPreloadStarted: (
    sourcesPreload: FrontComponentSourcesPreload,
  ) => void;
};

export const FrontComponentSourcesPreloadEffect = ({
  componentUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  applicationAccessToken,
  shouldPrefetchSdkClientSources,
  shouldPrefetchSharedDependenciesSource,
  onSourcesPreloadStarted,
}: FrontComponentSourcesPreloadEffectProps) => {
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

    onSourcesPreloadStarted({
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
    onSourcesPreloadStarted,
  ]);

  return null;
};
