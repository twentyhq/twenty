import { isDefined } from 'twenty-shared/utils';

import { type ApplicationAuthorizationEntity } from 'src/engine/core-modules/application/application-authorization/application-authorization.entity';

// Authorizing again clears revokedAt, so a token issued before the current authorization must stay dead
export const isApplicationTokenCoveredByAuthorization = ({
  authorization,
  token,
}: {
  authorization: Pick<
    ApplicationAuthorizationEntity,
    'revokedAt' | 'lastAuthorizedAt'
  >;
  token: { iat?: number };
}): boolean => {
  if (isDefined(authorization.revokedAt)) {
    return false;
  }

  if (!isDefined(authorization.lastAuthorizedAt)) {
    return true;
  }

  return (
    isDefined(token.iat) &&
    token.iat >=
      Math.floor(authorization.lastAuthorizedAt.getTime() / 1000)
  );
};
