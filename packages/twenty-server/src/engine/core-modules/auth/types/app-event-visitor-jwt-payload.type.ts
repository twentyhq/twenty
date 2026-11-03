import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { type JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type AppEventVisitorJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.APP_EVENT_VISITOR;
  workspaceId: string;
  applicationId: string;
  anonymousId: string;
  eventMetadataIds: string[];
  jti?: string;
  exp?: number;
};
