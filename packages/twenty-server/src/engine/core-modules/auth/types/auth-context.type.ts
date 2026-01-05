import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type AuthContext = {
  user?: UserEntity | null | undefined;
  apiKey?: ApiKeyEntity | null | undefined;
  workspaceMemberId?: string;
  workspaceMember?: WorkspaceMemberWorkspaceEntity;
  workspace?: WorkspaceEntity;
  application?: ApplicationEntity | null | undefined;
  userWorkspaceId?: string;
  userWorkspace?: UserWorkspaceEntity;
  authProvider?: AuthProviderEnum;
  impersonationContext?: {
    impersonatorUserWorkspaceId?: string;
    impersonatedUserWorkspaceId?: string;
  };
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
  APPLICATION = 'APPLICATION',
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

export type ApplicationTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPLICATION;
  workspaceId: string;
  applicationId: string;
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

export type RemoteServerTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.REMOTE_SERVER;
};

export type JwtPayload =
  | AccessTokenJwtPayload
  | ApiKeyTokenJwtPayload
  | ApplicationTokenJwtPayload
  | WorkspaceAgnosticTokenJwtPayload
  | LoginTokenJwtPayload
  | TransientTokenJwtPayload
  | RefreshTokenJwtPayload
  | FileTokenJwtPayload
  | PostgresProxyTokenJwtPayload
  | RemoteServerTokenJwtPayload;
