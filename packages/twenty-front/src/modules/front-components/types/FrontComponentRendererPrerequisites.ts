import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import {
  type FrontComponentSources,
  type SdkClientUrls,
} from 'twenty-front-component-renderer';

export type FrontComponentRendererPrerequisites = {
  frontComponent: ResolvedFrontComponent;
  applicationAccessToken: string;
  componentUrl: string;
  sdkClientUrls: SdkClientUrls;
  sharedDependenciesUrl: string;
  usesSharedDependencies: boolean;
  preloadedSourcesPromise?: Promise<FrontComponentSources | undefined>;
};
