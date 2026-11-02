import { isDefined } from 'twenty-shared/utils';

import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';
import { type ApplicationRefreshTokenJwtPayload } from 'src/engine/core-modules/auth/types/application-refresh-token-jwt-payload.type';

// Re-consenting clears revokedAt, so a token issued for an earlier consent must stay dead
export const isRefreshTokenCoveredByAuthorization = ({
  authorization,
  refreshToken,
}: {
  authorization: Pick<
    ApplicationAuthorizationEntity,
    'revokedAt' | 'lastAuthorizedAt' | 'consentId'
  >;
  refreshToken: Pick<ApplicationRefreshTokenJwtPayload, 'iat' | 'consentId'>;
}): boolean => {
  if (isDefined(authorization.revokedAt)) {
    return false;
  }

  if (
    isDefined(refreshToken.consentId) &&
    refreshToken.consentId !== authorization.consentId
  ) {
    return false;
  }

  if (!isDefined(authorization.lastAuthorizedAt)) {
    return true;
  }

  return (
    isDefined(refreshToken.iat) &&
    refreshToken.iat >=
      Math.floor(authorization.lastAuthorizedAt.getTime() / 1000)
  );
};
