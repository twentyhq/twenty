import { createHash, type JsonWebKey } from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';

import {
  JwtKeyManagerException,
  JwtKeyManagerExceptionCode,
} from 'src/engine/core-modules/jwt/jwt-key-manager.exception';

const base64UrlEncode = (input: Buffer): string =>
  input
    .toString('base64')
    .replace(/=+$/u, '')
    .replace(/\+/gu, '-')
    .replace(/\//gu, '_');

const canonicalizeEcJwk = (jwk: JsonWebKey): string => {
  if (
    !isNonEmptyString(jwk.crv) ||
    !isNonEmptyString(jwk.x) ||
    !isNonEmptyString(jwk.y)
  ) {
    throw new JwtKeyManagerException(
      'Invalid EC JWK: missing crv, x or y',
      JwtKeyManagerExceptionCode.INVALID_PUBLIC_KEY,
    );
  }

  return JSON.stringify({ crv: jwk.crv, kty: 'EC', x: jwk.x, y: jwk.y });
};

export const computeJwkThumbprint = (jwk: JsonWebKey): string => {
  if (jwk.kty !== 'EC') {
    throw new JwtKeyManagerException(
      `Unsupported JWK kty for thumbprint: ${jwk.kty}`,
      JwtKeyManagerExceptionCode.INVALID_PUBLIC_KEY,
    );
  }

  const canonical = canonicalizeEcJwk(jwk);
  const digest = createHash('sha256').update(canonical).digest();

  return base64UrlEncode(digest);
};
