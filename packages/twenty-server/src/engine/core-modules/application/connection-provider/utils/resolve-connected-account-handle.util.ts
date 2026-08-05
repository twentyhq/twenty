import { isDefined } from 'twenty-shared/utils';

import { type TokenExchangeResponse } from 'src/engine/core-modules/application/connection-provider/types/token-exchange-response.type';
import { extractEmailFromIdTokenClaims } from 'src/engine/core-modules/application/connection-provider/utils/extract-email-from-id-token-claims.util';

export const resolveConnectedAccountHandle = async ({
  tokenResponse,
  getFallbackHandle,
}: {
  tokenResponse: TokenExchangeResponse;
  getFallbackHandle: () => Promise<string>;
}): Promise<string> => {
  const idTokenEmail = isDefined(tokenResponse.idToken)
    ? extractEmailFromIdTokenClaims(tokenResponse.idToken)
    : null;

  if (isDefined(idTokenEmail)) {
    return idTokenEmail;
  }

  return getFallbackHandle();
};
