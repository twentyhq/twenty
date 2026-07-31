import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

export type UserSessionCreationOrigin = 'sign_in' | 'renewal_bridge';

export type CreateUserSessionInput = {
  userId: string;
  workspaceId?: string | null;
  userWorkspaceId?: string | null;
  authProvider: AuthProviderEnum;
  isImpersonating?: boolean;
  impersonatorUserWorkspaceId?: string | null;
  impersonatedUserWorkspaceId?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  origin: UserSessionCreationOrigin;
};

// Cached under the token hash in Redis; dates as ISO strings so the payload
// survives JSON serialization.
export type CachedUserSession = {
  sessionId: string;
  userId: string;
  workspaceId: string | null;
  userWorkspaceId: string | null;
  authProvider: AuthProviderEnum;
  isImpersonating: boolean;
  impersonatorUserWorkspaceId: string | null;
  impersonatedUserWorkspaceId: string | null;
  expiresAt: string;
  lastActiveAt: string;
};
