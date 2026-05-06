import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatAuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';
import { type FlatUserWorkspace } from 'src/engine/core-modules/user-workspace/types/flat-user-workspace.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export { AUTH_CONTEXT_USER_SELECT_FIELDS } from 'src/engine/core-modules/auth/constants/auth-context-user-select-fields.constants';
export { type FlatAuthContextUser as AuthContextUser } from 'src/engine/core-modules/auth/types/flat-auth-context-user.type';

export type RawAuthContext = {
  user?: FlatAuthContextUser | null | undefined;
  apiKey?: FlatApiKey | null | undefined;
  workspaceMemberId?: string;
  workspaceMember?: WorkspaceMemberWorkspaceEntity;
  workspace?: FlatWorkspace;
  application?: ApplicationEntity | null | undefined;
  userWorkspaceId?: string;
  userWorkspace?: FlatUserWorkspace;
  authProvider?: AuthProviderEnum;
  impersonationContext?: {
    impersonatorUserWorkspaceId?: string;
    impersonatedUserWorkspaceId?: string;
  };
};

// @deprecated Use WorkspaceAuthContext instead
export type AuthContext = RawAuthContext;

export type SerializableAuthContext = {
  userId?: string;
  userWorkspaceId?: string;
  workspaceMemberId?: string;
  apiKeyId?: string;
  applicationId?: string;
};

export enum JwtTokenTypeEnum {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  WORKSPACE_AGNOSTIC = 'WORKSPACE_AGNOSTIC',
  LOGIN = 'LOGIN',
  FILE = 'FILE',
  API_KEY = 'API_KEY',
  POSTGRES_PROXY = 'POSTGRES_PROXY',
  REMOTE_SERVER = 'REMOTE_SERVER',
  KEY_ENCRYPTION_KEY = 'KEY_ENCRYPTION_KEY',
  APPLICATION_ACCESS = 'APPLICATION_ACCESS',
  APPLICATION_REFRESH = 'APPLICATION_REFRESH',
  APP_OAUTH_STATE = 'APP_OAUTH_STATE',
}

type CommonPropertiesJwtPayload = {
  sub: string;
};

export type FileTokenJwtPayloadLegacy = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.FILE;
  workspaceId: string;
  filename: string;
  workspaceMemberId?: string;
  noteBlockId?: string;
  attachmentId?: string;
  personId?: string;
};

export type FileTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.FILE;
  workspaceId: string;
  fileId: string;
};

export type LoginTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.LOGIN;
  workspaceId: string;
  authProvider: AuthProviderEnum;
  impersonatorUserWorkspaceId?: string;
};

export type TransientTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.LOGIN;
  workspaceId: string;
  userId: string;
  workspaceMemberId: string;
};

export type RefreshTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.REFRESH;
  workspaceId?: string | null;
  userId: string;
  jti?: string;
  authProvider?: AuthProviderEnum;
  targetedTokenType: JwtTokenTypeEnum;
  isImpersonating?: boolean;
  impersonatorUserWorkspaceId?: string;
  impersonatedUserWorkspaceId?: string;
};

export type WorkspaceAgnosticTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.WORKSPACE_AGNOSTIC;
  userId: string;
  authProvider: AuthProviderEnum;
};

export type ApiKeyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.API_KEY;
  workspaceId: string;
  workspaceMemberId?: string;
  jti?: string;
};

export type ApplicationAccessTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPLICATION_ACCESS;
  workspaceId: string;
  applicationId: string;
  userWorkspaceId?: string;
  userId?: string;
};

export type ApplicationRefreshTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPLICATION_REFRESH;
  workspaceId: string;
  applicationId: string;
  userWorkspaceId?: string;
  userId?: string;
};

export type AccessTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.ACCESS;
  workspaceId: string;
  userId: string;
  workspaceMemberId?: string;
  userWorkspaceId: string;
  authProvider: AuthProviderEnum;
  isImpersonating?: boolean;
  impersonatorUserWorkspaceId?: string;
  impersonatedUserWorkspaceId?: string;
};

export type PostgresProxyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.POSTGRES_PROXY;
};

export type AppOAuthStateJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APP_OAUTH_STATE;
  workspaceId: string;
  connectionProviderId: string;
  userId: string;
  userWorkspaceId: string;
  // 'user' = the resulting credential is private to userWorkspaceId.
  // 'workspace' = visible to anyone in the workspace.
  // Named `visibility` to disambiguate from OAuth `scopes` on the row.
  visibility: 'user' | 'workspace';
  // If set, the callback updates this existing connectedAccount row instead
  // of creating a new one (used by the UI's "Reconnect" action).
  reconnectingConnectedAccountId: string | null;
  redirectLocation: string | null;
  codeVerifier: string | null;
};

export type JwtPayload =
  | AccessTokenJwtPayload
  | ApiKeyTokenJwtPayload
  | ApplicationAccessTokenJwtPayload
  | ApplicationRefreshTokenJwtPayload
  | WorkspaceAgnosticTokenJwtPayload
  | LoginTokenJwtPayload
  | TransientTokenJwtPayload
  | RefreshTokenJwtPayload
  | FileTokenJwtPayload
  | FileTokenJwtPayloadLegacy
  | PostgresProxyTokenJwtPayload
  | AppOAuthStateJwtPayload;
