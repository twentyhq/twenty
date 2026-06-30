import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApprovedAccessDomainJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APPROVED_ACCESS_DOMAIN;
  workspaceId: string;
  approvedAccessDomainId: string;
  domain: string;
};
