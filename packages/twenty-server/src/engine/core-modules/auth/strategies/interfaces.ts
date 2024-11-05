import { WorkspaceTokenType } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

export type JwtPayload = {
  sub: string;
  workspaceId?: string;
  workspaceMemberId?: string;
  jti?: string;
  type?: WorkspaceTokenType;
};
