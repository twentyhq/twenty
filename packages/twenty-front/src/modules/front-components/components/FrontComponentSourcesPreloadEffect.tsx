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
    const sourcesPromise = fetchFrontComponentSources({
      componentUrl,
      sdkClientUrls,
      sharedDependenciesUrl,
      applicationAccessToken,
      usesSdkClient,
      usesSharedDependencies,
    });

    sourcesPromise.catch(() => undefined);

    onSourcesPreloadStarted({
      componentUrl,
      sdkClientUrls,
      sharedDependenciesUrl,
      sourcesPromise,
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
