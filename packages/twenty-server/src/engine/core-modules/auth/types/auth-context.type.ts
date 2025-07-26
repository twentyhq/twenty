import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export type AuthContext = {
  user?: User | null | undefined;
  apiKey?: ApiKey | null | undefined;
  workspaceMemberId?: string;
  workspace?: Workspace;
  userWorkspaceId?: string;
  userWorkspace?: UserWorkspace;
  authProvider?: AuthProviderEnum;
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
}

type CommonPropertiesJwtPayload = {
  sub: string;
};

export type FileTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.FILE;
  workspaceId: string;
  filename: string;
  workspaceMemberId?: string;
  noteBlockId?: string;
  attachmentId?: string;
  personId?: string;
};

export type LoginTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.LOGIN;
  workspaceId: string;
  authProvider?: AuthProviderEnum;
};

export type TransientTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.LOGIN;
  workspaceId: string;
  userId: string;
  workspaceMemberId: string;
};

export type RefreshTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.REFRESH;
  workspaceId?: string;
  userId: string;
  jti?: string;
  authProvider?: AuthProviderEnum;
  targetedTokenType: JwtTokenTypeEnum;
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

export type AccessTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.ACCESS;
  workspaceId: string;
  userId: string;
  workspaceMemberId?: string;
  userWorkspaceId: string;
  authProvider?: AuthProviderEnum;
};

export type PostgresProxyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.POSTGRES_PROXY;
};

export type RemoteServerTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.REMOTE_SERVER;
};

export type JwtPayload =
  | AccessTokenJwtPayload
  | ApiKeyTokenJwtPayload
  | WorkspaceAgnosticTokenJwtPayload
  | LoginTokenJwtPayload
  | TransientTokenJwtPayload
  | RefreshTokenJwtPayload
  | FileTokenJwtPayload
  | PostgresProxyTokenJwtPayload
  | RemoteServerTokenJwtPayload;
