import { isDefined } from 'twenty-shared/utils';

import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';

// Re-consenting clears revokedAt, so a token issued before the latest consent must stay dead; iat has second precision
export const isRefreshTokenCoveredByAuthorization = ({
  authorization,
  refreshTokenIssuedAt,
}: {
  authorization: Pick<
    ApplicationAuthorizationEntity,
    'revokedAt' | 'lastAuthorizedAt'
  >;
  refreshTokenIssuedAt: number | undefined;
}): boolean => {
  if (isDefined(authorization.revokedAt)) {
    return false;
  }

  if (!isDefined(authorization.lastAuthorizedAt)) {
    return true;
  }

  return (
    isDefined(refreshTokenIssuedAt) &&
    refreshTokenIssuedAt >=
      Math.floor(authorization.lastAuthorizedAt.getTime() / 1000)
  );
};
