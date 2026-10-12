import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationRegistrationGithubClaimStateJwtPayload =
  CommonPropertiesJwtPayload & {
    type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE;
    applicationRegistrationId: string;
    workspaceId: string;
    userId: string | null;
    nonceHash: string;
    // The nonce cookie is host-bound and GitHub calls back on SERVER_URL, so
    // the callback needs to know which host received the cookie.
    cookieOrigin: string;
  };
