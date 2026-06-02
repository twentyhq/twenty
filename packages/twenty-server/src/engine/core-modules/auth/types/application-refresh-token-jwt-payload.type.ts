import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationRefreshTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPLICATION_REFRESH;
  workspaceId: string;
  applicationId: string;
  userWorkspaceId?: string;
  userId?: string;
};
