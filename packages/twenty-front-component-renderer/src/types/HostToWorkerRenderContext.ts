import { type SdkClientUrls } from '@/types/SdkClientUrls';

export type HostToWorkerRenderContext = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  hostFetchOrigins?: string[];
  applicationVariables?: Record<string, string>;
};
