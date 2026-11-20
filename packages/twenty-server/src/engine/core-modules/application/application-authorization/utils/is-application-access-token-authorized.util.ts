import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationAuthorization } from 'src/engine/core-modules/application/application-authorization/types/flat-application-authorization.type';
import { isApplicationTokenCoveredByAuthorization } from 'src/engine/core-modules/application/application-authorization/utils/is-application-token-covered-by-authorization.util';

export const isApplicationAccessTokenAuthorized = ({
  flatApplicationAuthorization,
  token,
}: {
  flatApplicationAuthorization: FlatApplicationAuthorization | null;
  token: { iat?: number };
}): boolean => {
  if (!isDefined(flatApplicationAuthorization)) {
    return false;
  }

  const { lastAuthorizedAt, revokedAt } = flatApplicationAuthorization;

  return isApplicationTokenCoveredByAuthorization({
    authorization: {
      lastAuthorizedAt: isDefined(lastAuthorizedAt)
        ? new Date(lastAuthorizedAt)
        : null,
      revokedAt: isDefined(revokedAt) ? new Date(revokedAt) : null,
    },
    token,
  });
};
