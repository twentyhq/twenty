import { type CommonPropertiesJwtPayload } from 'src/engine/core-modules/auth/types/common-properties-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';

export type ApplicationRegistrationGithubClaimStateJwtPayload =
  CommonPropertiesJwtPayload & {
    type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE;
    applicationRegistrationId: string;
    workspaceId: string;
    userId: string | null;
    // sha256 of the nonce stored in the claim-state cookie of the browser that
    // started the flow: the state alone is not proof of anything, since the
    // whole authorization url can be forwarded to someone else.
    nonceHash: string;
  };
