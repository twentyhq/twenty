export type RemoteCredentials =
  | { kind: 'apiKey'; apiKey: string }
  | {
      kind: 'oauth';
      accessToken: string;
      refreshToken?: string;
      clientId: string;
    };
