import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

interface BaseWorkspaceAuthContext {
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
}

export interface ApiKeyWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  apiKey: NonNullable<AuthContext['apiKey']>;
}

export interface UserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: NonNullable<AuthContext['user']>;
  workspaceMemberId: NonNullable<AuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<AuthContext['workspaceMember']>;
}

export interface ApplicationWorkspaceAuthContext
  extends BaseWorkspaceAuthContext {
  application: NonNullable<AuthContext['application']>;
}

export interface SystemWorkspaceAuthContext extends BaseWorkspaceAuthContext {}

export type WorkspaceAuthContext =
  | ApiKeyWorkspaceAuthContext
  | UserWorkspaceAuthContext
  | ApplicationWorkspaceAuthContext
  | SystemWorkspaceAuthContext;
