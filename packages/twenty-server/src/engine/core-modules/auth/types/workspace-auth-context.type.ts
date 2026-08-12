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
  application?: NonNullable<RawAuthContext['application']>;
  // Provenance only: the application whose agent is acting for this user in a
  // run-as execution. Unlike `application` (a user-bound application token) it
  // must never participate in role resolution — the member's own role is the
  // permission boundary until install-time application grants exist.
  viaApplication?: NonNullable<RawAuthContext['application']>;
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
