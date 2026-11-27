import { generateKeyPairSync } from 'crypto';

import { parseIdentityAssertionSigningKeys } from 'src/engine/core-modules/auth/identity-assertion/utils/parse-identity-assertion-signing-keys.util';

const rsaJsonWebKey = generateKeyPairSync('rsa', {
  modulusLength: 2048,
}).publicKey.export({ format: 'jwk' });

const ellipticCurveJsonWebKey = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
}).publicKey.export({ format: 'jwk' });

describe('parseIdentityAssertionSigningKeys', () => {
  it('should index RSA and elliptic curve keys by key id', () => {
    const signingKeys = parseIdentityAssertionSigningKeys({
      keys: [
        { kid: 'rsa-key', ...rsaJsonWebKey },
        { kid: 'elliptic-curve-key', ...ellipticCurveJsonWebKey },
      ],
    });

    expect([...signingKeys.keys()]).toEqual(['rsa-key', 'elliptic-curve-key']);
    expect(signingKeys.get('rsa-key')?.asymmetricKeyType).toBe('rsa');
    expect(signingKeys.get('elliptic-curve-key')?.asymmetricKeyType).toBe('ec');
  });

  it('should skip a key it cannot use and keep the others', () => {
    const signingKeys = parseIdentityAssertionSigningKeys({
      keys: [
        { kid: 'unknown-curve', ...ellipticCurveJsonWebKey, crv: 'P-000' },
        { kid: 'unsupported-type', kty: 'OKP', crv: 'Ed25519', x: 'x' },
        { kid: 'without-material', kty: 'RSA' },
        { kty: 'RSA', n: rsaJsonWebKey.n, e: rsaJsonWebKey.e },
        { kid: 'rsa-key', ...rsaJsonWebKey },
      ],
    });

    expect([...signingKeys.keys()]).toEqual(['rsa-key']);
  });

  it('should return no key for an empty key set', () => {
    expect(parseIdentityAssertionSigningKeys({ keys: [] }).size).toBe(0);
  });

  it('should throw when the response is not a key set', () => {
    expect(() => parseIdentityAssertionSigningKeys('not a key set')).toThrow();
  });
});
