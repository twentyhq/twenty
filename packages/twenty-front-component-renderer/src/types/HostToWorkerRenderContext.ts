export type SdkClientUrls = {
  core: string;
  metadata: string;
};

export type HostToWorkerRenderContext = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  hostFetchOrigins?: string[];
  applicationVariables?: Record<string, string>;
};
