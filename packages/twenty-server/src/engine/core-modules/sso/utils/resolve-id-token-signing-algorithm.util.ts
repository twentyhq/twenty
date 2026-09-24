/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { type IssuerMetadata } from 'openid-client';

const PREFERRED_ID_TOKEN_SIGNING_ALGORITHM = 'RS256';

export const resolveIdTokenSigningAlgorithm = (
  issuerMetadata: IssuerMetadata,
): string | undefined => {
  const supportedAlgorithms =
    issuerMetadata.id_token_signing_alg_values_supported;

  if (!Array.isArray(supportedAlgorithms)) {
    return undefined;
  }

  // An unsigned id_token would be accepted without any signature check
  const signedAlgorithms = supportedAlgorithms.filter(
    (algorithm): algorithm is string =>
      isNonEmptyString(algorithm) && algorithm !== 'none',
  );

  if (signedAlgorithms.includes(PREFERRED_ID_TOKEN_SIGNING_ALGORITHM)) {
    return PREFERRED_ID_TOKEN_SIGNING_ALGORITHM;
  }

  return signedAlgorithms[0];
};
