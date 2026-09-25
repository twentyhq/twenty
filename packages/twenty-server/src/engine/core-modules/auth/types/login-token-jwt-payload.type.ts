import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

export type LoginTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.LOGIN;
  workspaceId: string;
  authProvider: AuthProviderEnum;
  /**
   * Unique token identifier used to enforce single-use login tokens.
   * Consumed atomically on first successful exchange.
   */
  jti: string;
  impersonatorUserWorkspaceId?: string;
};
