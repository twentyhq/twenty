import { createPublicKey } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { verify } from 'jsonwebtoken';
import { isPlainObject } from 'twenty-shared/utils';

import { SERVER_ROUTE_BEARER_TOKEN_CLOCK_TOLERANCE_SECONDS } from 'src/engine/core-modules/server-route-trigger/constants/server-route-bearer-token-clock-tolerance-seconds.constant';
import { type ServerRouteBearerTokenVerificationResult } from 'src/engine/core-modules/server-route-trigger/types/server-route-bearer-token-verification-result.type';
import { type ServerRouteSigningKey } from 'src/engine/core-modules/server-route-trigger/types/server-route-signing-key.type';

export const verifyServerRouteBearerToken = ({
  token,
  signingKey,
  issuer,
  audience,
  requiredKeyEndorsement,
}: {
  token: string;
  signingKey: ServerRouteSigningKey;
  issuer: string;
  audience: string;
  requiredKeyEndorsement?: string;
}): ServerRouteBearerTokenVerificationResult => {
  if (
    isNonEmptyString(requiredKeyEndorsement) &&
    !(signingKey.endorsements ?? []).includes(requiredKeyEndorsement)
  ) {
    return {
      isValid: false,
      reason: `Bearer token signing key is not endorsed for ${requiredKeyEndorsement}`,
    };
  }

  try {
    const claims = verify(
      token,
      createPublicKey({
        key: { kty: signingKey.kty, n: signingKey.n, e: signingKey.e },
        format: 'jwk',
      }),
      {
        algorithms: ['RS256'],
        issuer,
        audience,
        clockTolerance: SERVER_ROUTE_BEARER_TOKEN_CLOCK_TOLERANCE_SECONDS,
      },
    );

    if (!isPlainObject(claims)) {
      return { isValid: false, reason: 'Bearer token carries no claims' };
    }

    return { isValid: true, claims };
  } catch (error) {
    return {
      isValid: false,
      reason: `Bearer token verification failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    };
  }
};
