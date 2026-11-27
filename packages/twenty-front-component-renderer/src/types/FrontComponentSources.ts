import { type SdkClientSources } from '@/types/SdkClientSources';

export type FrontComponentSources = {
  componentSource: string;
  sdkClientSources?: SdkClientSources;
  sharedDependenciesSource?: string;
};
