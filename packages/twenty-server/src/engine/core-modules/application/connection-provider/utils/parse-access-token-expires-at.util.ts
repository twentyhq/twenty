import { isNumber } from '@sniptt/guards';
import { addSeconds, fromUnixTime } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

import { parseExpiresInSeconds } from 'src/engine/core-modules/application/connection-provider/utils/parse-expires-in-seconds.util';
import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

export const parseAccessTokenExpiresAt = (
  expiresIn: unknown,
  accessToken: PlaintextString,
): Date | null => {
  const expiresInSeconds = parseExpiresInSeconds(expiresIn);

  if (isDefined(expiresInSeconds)) {
    return addSeconds(new Date(), expiresInSeconds);
  }

  const expirationEpochSeconds = decodeJwtPayload<{ exp?: unknown }>(
    accessToken,
  )?.exp;

  return isNumber(expirationEpochSeconds) &&
    Number.isFinite(expirationEpochSeconds)
    ? fromUnixTime(expirationEpochSeconds)
    : null;
};
