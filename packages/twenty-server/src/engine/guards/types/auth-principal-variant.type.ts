import { type UserSessionVariant } from 'src/engine/core-modules/auth/types/user-session-variant.type';

export type AuthPrincipalVariant =
  | {
      kind: 'userSession';
      variant: UserSessionVariant | 'workspaceAgnostic';
    }
  | { kind: 'apiKey' }
  | { kind: 'oauthClient'; variant: 'withUser' | 'withoutUser' }
  | {
      kind: 'application';
      variant: 'withUser' | 'withoutUser';
      withAgent: boolean;
    };
