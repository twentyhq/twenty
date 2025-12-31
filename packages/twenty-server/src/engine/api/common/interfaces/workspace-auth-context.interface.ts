import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface AuthContextWithDefinedWorkspaceProperties {
  user: AuthContext['user'];
  application: AuthContext['application'];
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
  workspaceMemberId: AuthContext['workspaceMemberId'];
  workspaceMember: AuthContext['workspaceMember'];
  userWorkspaceId: AuthContext['userWorkspaceId'];
  apiKey: AuthContext['apiKey'];
}

interface ApiKeyAuthContext extends Request {
  apiKey: NonNullable<AuthContext['apiKey']>;
}

interface UserWorkspaceAuthContext extends Request {
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
}

interface ApplicationAuthContext extends Request {
  application: NonNullable<AuthContext['application']>;
}

export type WorkspaceAuthContext = AuthContextWithDefinedWorkspaceProperties &
  (ApiKeyAuthContext | UserWorkspaceAuthContext | ApplicationAuthContext);
