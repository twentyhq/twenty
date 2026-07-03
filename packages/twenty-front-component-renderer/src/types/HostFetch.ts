export type HostFetchInput = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export type HostFetchResult = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
};

export type HostFetchFunction = (
  input: HostFetchInput,
) => Promise<HostFetchResult>;
