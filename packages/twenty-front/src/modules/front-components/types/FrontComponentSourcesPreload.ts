import {
  type FrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

export type FrontComponentSourcesPreload = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  shouldPrefetchSdkClientSources: boolean;
  shouldPrefetchSharedDependenciesSource: boolean;
  sourcesPromise: Promise<FrontComponentSources | undefined>;
};
