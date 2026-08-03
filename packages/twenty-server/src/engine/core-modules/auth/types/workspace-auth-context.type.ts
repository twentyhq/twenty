import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export type WorkspaceAuthContextType =
  | 'system'
  | 'user'
  | 'apiKey'
  | 'application'
  | 'pendingActivationUser';

interface BaseWorkspaceAuthContext {
  type: WorkspaceAuthContextType;
  workspace: NonNullable<RawAuthContext['workspace']>;
}

export interface ApiKeyWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'apiKey';
  apiKey: NonNullable<RawAuthContext['apiKey']>;
}

export interface UserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'user';
  userWorkspaceId: NonNullable<RawAuthContext['userWorkspaceId']>;
  user: NonNullable<RawAuthContext['user']>;
  workspaceMemberId: NonNullable<RawAuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<RawAuthContext['workspaceMember']>;
  // Set when an application is acting on this user's behalf. The request stays
  // a user context, because it runs as the person, but permissions are bounded
  // by the application's role as well as theirs.
  application?: NonNullable<RawAuthContext['application']>;
}

export interface ApplicationWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'application';
  application: NonNullable<RawAuthContext['application']>;
}

export interface SystemWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'system';
}

export interface PendingActivationUserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'pendingActivationUser';
  userWorkspaceId: NonNullable<RawAuthContext['userWorkspaceId']>;
  user: NonNullable<RawAuthContext['user']>;
}

export type WorkspaceAuthContext =
  | ApiKeyWorkspaceAuthContext
  | UserWorkspaceAuthContext
  | ApplicationWorkspaceAuthContext
  | SystemWorkspaceAuthContext
  | PendingActivationUserWorkspaceAuthContext;
