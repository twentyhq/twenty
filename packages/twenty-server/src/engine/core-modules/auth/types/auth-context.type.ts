import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

export type AuthContext = {
  user?: User | null | undefined;
  apiKey?: ApiKeyWorkspaceEntity | null | undefined;
  workspaceMemberId?: string;
  workspace: Workspace;
  userWorkspaceId?: string;
};

type CommonPropertiesJwtPayload = {
  sub: string;
};

export type FileTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'FILE';
  workspaceId: string;
  workspaceMemberId?: string;
  noteBlockId?: string;
  attachmentId?: string;
  personId?: string;
};

export type LoginTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'LOGIN';
  workspaceId: string;
};

export type TransientTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'LOGIN';
  workspaceId: string;
  userId: string;
  workspaceMemberId: string;
};

export type RefreshTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'REFRESH';
  workspaceId: string;
  userId: string;
  jti: string;
};

export type WorkspaceAgnosticTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'WORKSPACE_AGNOSTIC';
  userId: string;
};

export type ApiKeyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'API_KEY';
  workspaceId: string;
  workspaceMemberId?: string;
  jti: string;
};

export type AccessTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'ACCESS';
  workspaceId: string;
  userId: string;
  workspaceMemberId?: string;
  userWorkspaceId: string;
};

export type PostgresProxyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'POSTGRES_PROXY';
};

export type RemoteServerTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: 'REMOTE_SERVER';
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

export type JwtAuthTokenType = JwtPayload['type'];
