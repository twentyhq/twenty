import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';
import { type SdkClientUrls } from 'twenty-front-component-renderer';

export type FrontComponentRendererPrerequisites = {
  frontComponent: ResolvedFrontComponent;
  applicationAccessToken: string;
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  preloadedSourcesPromise?: FrontComponentSourcesPreload['sourcesPromise'];
};
