import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface AuthContextWithDefinedWorkspaceProperties {
  user: AuthContext['user'];
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
  workspaceMemberId: AuthContext['workspaceMemberId'];
  userWorkspaceId: AuthContext['userWorkspaceId'];
  apiKey: AuthContext['apiKey'];
}

interface ApiKeyAuthContext extends Request {
  apiKey: NonNullable<AuthContext['apiKey']>;
}

interface UserWorkspaceAuthContext extends Request {
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
}

export type WorkspaceAuthContext = AuthContextWithDefinedWorkspaceProperties &
  (ApiKeyAuthContext | UserWorkspaceAuthContext);
