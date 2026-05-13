export type SdkClientUrls = {
  core: string;
  metadata: string;
};

export type HostToWorkerRenderContext = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
};
