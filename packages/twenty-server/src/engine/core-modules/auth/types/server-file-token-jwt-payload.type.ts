import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

// Instance-level files have no workspace: the token names the registration owning the file
export type ServerFileTokenJwtPayload = CommonPropertiesJwtPayload & {
  type: JwtTokenTypeEnum.FILE;
  applicationRegistrationId: string;
  fileId: string;
};
