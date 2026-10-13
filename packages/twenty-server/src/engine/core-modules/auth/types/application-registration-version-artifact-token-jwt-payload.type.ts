import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationRegistrationVersionArtifactTokenJwtPayload =
  CommonPropertiesJwtPayload & {
    type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_VERSION_ARTIFACT;
    applicationRegistrationVersionId: string;
  };
