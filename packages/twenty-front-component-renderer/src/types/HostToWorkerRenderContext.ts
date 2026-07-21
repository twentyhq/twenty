import { type SdkClientSources } from '@/types/SdkClientSources';

export type HostToWorkerRenderContext = {
  componentUrl: string;
  componentSource: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientSources?: SdkClientSources;
  hostFetchOrigins?: string[];
  applicationVariables?: Record<string, string>;
};
