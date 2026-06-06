import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApiKeyTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.API_KEY;
  workspaceId: string;
  workspaceMemberId?: string;
  jti?: string;
};
