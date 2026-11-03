import { type ActingAgent } from 'src/engine/core-modules/auth/types/acting-agent.type';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type AiRunPermissionScope } from 'src/engine/permissions/principal/types/ai-run-permission-scope.type';
import { type UserSessionVariant } from 'src/engine/core-modules/auth/types/user-session-variant.type';

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
  // Set when the key runs an agent: the agent and its application narrow the key's roles
  application?: NonNullable<RawAuthContext['application']>;
  agentId?: string;
  aiRunScope?: AiRunPermissionScope;
}

export interface UserWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'user';
  userWorkspaceId: NonNullable<RawAuthContext['userWorkspaceId']>;
  user: NonNullable<RawAuthContext['user']>;
  workspaceMemberId: NonNullable<RawAuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<RawAuthContext['workspaceMember']>;
  // Taken from the request token; contexts rebuilt outside a request are standard
  userSessionVariant: UserSessionVariant;
  application?: NonNullable<RawAuthContext['application']>;
  agentId?: string;
  // Set when an AI run narrows the caller to an inline scope
  aiRunScope?: AiRunPermissionScope;
}

export interface ApplicationWorkspaceAuthContext extends BaseWorkspaceAuthContext {
  type: 'application';
  application: NonNullable<RawAuthContext['application']>;
  // Set when one of the application's agents runs on its own, so its writes are attributed to it
  actingAgent?: ActingAgent;
  // The agent named in the token only narrows its roles; unlike actingAgent, writes are not attributed to it
  agentId?: string;
  aiRunScope?: AiRunPermissionScope;
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
