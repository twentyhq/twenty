export type AuthPrincipalVariant =
  | {
      kind: 'userSession';
      variant: 'standard' | 'impersonated' | 'playground' | 'workspaceAgnostic';
    }
  | { kind: 'apiKey' }
  | {
      kind: 'oauthClient' | 'application';
      variant: 'withUser' | 'withoutUser';
    };
