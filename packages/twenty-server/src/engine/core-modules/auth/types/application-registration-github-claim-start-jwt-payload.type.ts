import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationRegistrationGithubClaimStartJwtPayload =
  CommonPropertiesJwtPayload & {
    type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_START;
    applicationRegistrationId: string;
    workspaceId: string;
    userId: string | null;
  };
