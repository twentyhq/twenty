import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface AuthContextWithDefinedWorkspaceProperties {
  user: AuthContext['user'];
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
  workspaceMemberId: AuthContext['workspaceMemberId'];
}

interface ApiKeyAuthContext extends Request {
  apiKey: NonNullable<AuthContext['apiKey']>;
  userWorkspaceId?: undefined;
}

interface UserWorkspaceAuthContext extends Request {
  apiKey?: undefined;
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
}

export type WorkspaceAuthContext = AuthContextWithDefinedWorkspaceProperties &
  (ApiKeyAuthContext | UserWorkspaceAuthContext);
