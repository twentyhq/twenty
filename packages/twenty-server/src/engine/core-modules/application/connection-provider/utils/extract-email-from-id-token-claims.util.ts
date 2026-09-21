import { decodeJwtPayload } from 'src/engine/core-modules/jwt/utils/decode-jwt-payload.util';

export const extractEmailFromIdTokenClaims = (
  idToken: string,
): string | null => {
  const claims = decodeJwtPayload<{ email?: string; upn?: string }>(idToken);
  const email = claims?.email ?? claims?.upn;

  return typeof email === 'string' ? email : null;
};
