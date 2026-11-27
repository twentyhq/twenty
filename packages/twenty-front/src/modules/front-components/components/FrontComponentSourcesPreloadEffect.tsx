import { useEffect } from 'react';
import {
  fetchFrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

import { type PreloadedFrontComponentSources } from '@/front-components/types/PreloadedFrontComponentSources';

type FrontComponentSourcesPreloadEffectProps = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  applicationAccessToken: string;
  usesSdkClient: boolean;
  usesSharedDependencies: boolean;
  onSourcesPreloadStarted: (
    preloadedSources: PreloadedFrontComponentSources,
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
    const fetchSourcesOrUndefined = async () => {
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
      sourcesPromise: fetchSourcesOrUndefined(),
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
