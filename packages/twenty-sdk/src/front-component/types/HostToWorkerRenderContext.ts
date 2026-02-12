export type HostToWorkerRenderContext = {
  componentUrl: string;
  authToken: string;
  applicationAccessToken?: string;
  applicationRefreshToken?: string;
  apiUrl?: string;
};
