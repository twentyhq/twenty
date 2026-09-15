export type HostFetchInput = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};
