import {
  type FrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

export type PreloadedFrontComponentSources = {
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  sourcesPromise: Promise<FrontComponentSources>;
};
