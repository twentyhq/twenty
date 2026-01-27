import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface BaseWorkspaceAuthContext {
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
}

export interface ApiKeyWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  apiKey: NonNullable<AuthContext['apiKey']>;
  userWorkspaceId?: undefined;
  application?: undefined;
  user?: undefined;
  workspaceMemberId?: undefined;
  workspaceMember?: undefined;
}

export interface UserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: AuthContext['user'];
  workspaceMemberId: AuthContext['workspaceMemberId'];
  workspaceMember: AuthContext['workspaceMember'];
  apiKey?: undefined;
  application?: undefined;
}

export interface ApplicationWorkspaceAuthContext
  extends BaseWorkspaceAuthContext {
  application: NonNullable<AuthContext['application']>;
  apiKey?: undefined;
  userWorkspaceId?: undefined;
  user?: undefined;
  workspaceMemberId?: undefined;
  workspaceMember?: undefined;
}

export interface SystemWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  apiKey?: undefined;
  userWorkspaceId?: undefined;
  application?: undefined;
  user?: undefined;
  workspaceMemberId?: undefined;
  workspaceMember?: undefined;
}

export type WorkspaceAuthContext =
  | ApiKeyWorkspaceAuthContext
  | UserWorkspaceAuthContext
  | ApplicationWorkspaceAuthContext
  | SystemWorkspaceAuthContext;
