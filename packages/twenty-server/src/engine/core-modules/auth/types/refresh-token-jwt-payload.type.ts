import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

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
