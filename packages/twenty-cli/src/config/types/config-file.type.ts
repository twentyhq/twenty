export type RemoteEntry = {
  apiUrl: string;
  apiKey?: string;
  twentyCLIAccessToken?: string;
  twentyCLIRefreshToken?: string;
  twentyCLIRegistrationClientId?: string;
  workspaceName?: string;
  proxyHeaders?: Record<string, string>;
  proxyHeaderCommand?: string;
  [field: string]: unknown;
};

export type ConfigFile = {
  version: 1;
  defaultRemote?: string;
  remotes: Record<string, RemoteEntry>;
  [field: string]: unknown;
};
