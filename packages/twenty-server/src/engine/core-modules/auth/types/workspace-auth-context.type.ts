import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export type WorkspaceAuthContextType =
  | 'system'
  | 'user'
  | 'apiKey'
  | 'application'
  | 'pendingActivationUser';

interface BaseWorkspaceAuthContext {
  type: WorkspaceAuthContextType;
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
}

export interface ApiKeyWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'apiKey';
  apiKey: NonNullable<AuthContext['apiKey']>;
}

export interface UserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'user';
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: NonNullable<AuthContext['user']>;
  workspaceMemberId: NonNullable<AuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<AuthContext['workspaceMember']>;
}

export interface ApplicationWorkspaceAuthContext
  extends BaseWorkspaceAuthContext {
  type: 'application';
  application: NonNullable<AuthContext['application']>;
}

export interface SystemWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'system';
}

export interface PendingActivationUserWorkspaceAuthContext
  extends BaseWorkspaceAuthContext {
  type: 'pendingActivationUser';
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: NonNullable<AuthContext['user']>;
}

export type WorkspaceAuthContext =
  | ApiKeyWorkspaceAuthContext
  | UserWorkspaceAuthContext
  | ApplicationWorkspaceAuthContext
  | SystemWorkspaceAuthContext
  | PendingActivationUserWorkspaceAuthContext;
