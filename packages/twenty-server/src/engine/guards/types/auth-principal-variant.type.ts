export type AuthPrincipalVariant =
  | {
      kind: 'userSession';
      variant: 'standard' | 'impersonated' | 'playground' | 'workspaceAgnostic';
    }
  | { kind: 'apiKey' }
  | { kind: 'oauthClient'; variant: 'withUser' | 'withoutUser' }
  | {
      kind: 'application';
      variant: 'withUser' | 'withoutUser';
      withAgent: boolean;
    };
