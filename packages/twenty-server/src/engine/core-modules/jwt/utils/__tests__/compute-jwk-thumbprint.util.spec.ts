import { generateKeyPairSync } from 'crypto';

import { JwtKeyManagerException } from 'src/engine/core-modules/jwt/jwt-key-manager.exception';
import { computeJwkThumbprint } from 'src/engine/core-modules/jwt/utils/compute-jwk-thumbprint.util';

const generateP256Jwk = () => {
  const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });

  return publicKey.export({ format: 'jwk' });
};

describe('computeJwkThumbprint', () => {
  it('produces the same thumbprint regardless of EC JWK property order', () => {
    const jwk = generateP256Jwk();

    const orderedA = { crv: jwk.crv, kty: jwk.kty, x: jwk.x, y: jwk.y };
    const orderedB = { y: jwk.y, x: jwk.x, kty: jwk.kty, crv: jwk.crv };

    expect(computeJwkThumbprint(orderedA)).toBe(computeJwkThumbprint(orderedB));
  });

  it('throws JwtKeyManagerException for non-EC kty (only ES256 / EC supported)', () => {
    expect(() =>
      computeJwkThumbprint({ kty: 'RSA', e: 'AQAB', n: 'whatever' }),
    ).toThrow(JwtKeyManagerException);
  });

  it('throws JwtKeyManagerException for an EC JWK missing crv/x/y', () => {
    expect(() => computeJwkThumbprint({ kty: 'EC' })).toThrow(
      JwtKeyManagerException,
    );
  });
});
