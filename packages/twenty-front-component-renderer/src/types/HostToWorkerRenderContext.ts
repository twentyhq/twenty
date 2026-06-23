export type SdkClientUrls = {
  core: string;
  metadata: string;
};

export type HostToWorkerRenderContext = {
  componentUrl: string;
  applicationAccessToken?: string;
  apiUrl?: string;
  // Isolated public domain base for this workspace's HTTP logic functions
  // (e.g. https://acme.withtwenty.com). When set, RestApiClient routes /s
  // calls here instead of {apiUrl}/s. Undefined when self-hosting.
  functionsBaseUrl?: string;
  sdkClientUrls?: SdkClientUrls;
  applicationVariables?: Record<string, string>;
};
