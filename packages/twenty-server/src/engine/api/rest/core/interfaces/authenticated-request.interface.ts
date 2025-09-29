import { type Request } from 'express';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

//AuthenticatedRequest for services behind JwtAuthGuard and WorkspaceAuthGuard

interface AuthenticatedRequestProperties {
  user: AuthContext['user'];
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
  workspaceMemberId: AuthContext['workspaceMemberId'];
}

interface ApiKeyAuthenticatedRequest extends Request {
  apiKey: NonNullable<AuthContext['apiKey']>;
  userWorkspaceId?: undefined;
}

interface UserWorkspaceAuthenticatedRequest extends Request {
  apiKey?: undefined;
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
}

export type AuthenticatedRequest = Request &
  AuthenticatedRequestProperties &
  (ApiKeyAuthenticatedRequest | UserWorkspaceAuthenticatedRequest);
