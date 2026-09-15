import { type UserSessionCreationOrigin } from 'src/engine/core-modules/user-session/types/user-session-creation-origin.type';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

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
