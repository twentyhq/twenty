import { useEffect } from 'react';
import {
  fetchFrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';

type FrontComponentSourcesPreloadEffectProps = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  applicationAccessToken: string;
  usesSdkClient: boolean;
  usesSharedDependencies: boolean;
  onSourcesPreloadStarted: (
    sourcesPreload: FrontComponentSourcesPreload,
  ) => void;
};

export const FrontComponentSourcesPreloadEffect = ({
  componentUrl,
  sdkClientUrls,
  sharedDependenciesUrl,
  applicationAccessToken,
  usesSdkClient,
  usesSharedDependencies,
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
          usesSdkClient,
          usesSharedDependencies,
        });
      } catch {
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
    usesSdkClient,
    usesSharedDependencies,
    onSourcesPreloadStarted,
  ]);

  return null;
};
