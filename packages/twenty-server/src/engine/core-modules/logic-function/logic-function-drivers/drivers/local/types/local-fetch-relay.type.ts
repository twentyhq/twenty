export type LocalFetchRelayRequest = {
  url: string;
  method: string;
  headers: [string, string][];
  body?: string;
  redirect: RequestRedirect;
};

export type LocalFetchRelayResponse = {
  status: number;
  statusText: string;
  headers: [string, string][];
  body?: string;
};

export type LocalFetchRelayHandler = (params: {
  request: LocalFetchRelayRequest;
  signal: AbortSignal;
}) => Promise<LocalFetchRelayResponse>;
