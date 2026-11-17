import { generateKeyPairSync } from 'crypto';

import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

import { verifyIdentityAssertion } from 'src/engine/core-modules/auth/identity-assertion/utils/verify-identity-assertion.util';

const ISSUER = 'https://identity-proxy.test';
const AUDIENCE = 'server-admin-audience';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const signAssertion = ({
  payload = { email: 'jane@twenty.com' },
  signingKey = privateKey,
  algorithm = 'RS256',
  issuer = ISSUER,
  audience = AUDIENCE,
  expiresIn = 60,
}: {
  payload?: Record<string, unknown>;
  signingKey?: jwt.Secret;
  algorithm?: jwt.Algorithm;
  issuer?: string;
  audience?: string;
  expiresIn?: number | null;
} = {}) =>
  jwt.sign(payload, signingKey, {
    algorithm,
    issuer,
    audience,
    ...(isDefined(expiresIn) ? { expiresIn } : {}),
  });

const verify = (assertion: string) =>
  verifyIdentityAssertion({
    assertion,
    signingKey: publicKey,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

describe('verifyIdentityAssertion', () => {
  it('should return the email of a valid assertion', () => {
    expect(verify(signAssertion())).toEqual({
      isValid: true,
      email: 'jane@twenty.com',
    });
  });

  it('should accept an assertion signed with an elliptic curve key', () => {
    const ellipticCurveKeyPair = generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });

    expect(
      verifyIdentityAssertion({
        assertion: signAssertion({
          signingKey: ellipticCurveKeyPair.privateKey,
          algorithm: 'ES256',
        }),
        signingKey: ellipticCurveKeyPair.publicKey,
        issuer: ISSUER,
        audience: AUDIENCE,
      }),
    ).toEqual({ isValid: true, email: 'jane@twenty.com' });
  });

  it('should refuse an assertion without email', () => {
    expect(verify(signAssertion({ payload: {} })).isValid).toBe(false);
  });

  it('should refuse an assertion with an empty email', () => {
    expect(verify(signAssertion({ payload: { email: '' } })).isValid).toBe(
      false,
    );
  });

  it('should refuse an assertion without expiry', () => {
    expect(verify(signAssertion({ expiresIn: null })).isValid).toBe(false);
  });

  it('should refuse an assertion for another audience', () => {
    expect(verify(signAssertion({ audience: 'another-audience' }))).toEqual({
      isValid: false,
      error: `jwt audience invalid. expected: ${AUDIENCE}`,
    });
  });

  it('should refuse an assertion from another issuer', () => {
    expect(
      verify(signAssertion({ issuer: 'https://another-identity-proxy.test' })),
    ).toEqual({
      isValid: false,
      error: `jwt issuer invalid. expected: ${ISSUER}`,
    });
  });

  it('should refuse an expired assertion', () => {
    expect(verify(signAssertion({ expiresIn: -60 }))).toEqual({
      isValid: false,
      error: 'jwt expired',
    });
  });

  it('should refuse an assertion signed by another key', () => {
    const { privateKey: anotherPrivateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    expect(verify(signAssertion({ signingKey: anotherPrivateKey }))).toEqual({
      isValid: false,
      error: 'invalid signature',
    });
  });

  it('should refuse an assertion signed with the public key as a shared secret', () => {
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });

    expect(
      verify(signAssertion({ signingKey: publicKeyPem, algorithm: 'HS256' })),
    ).toEqual({ isValid: false, error: 'invalid algorithm' });
  });

  it('should refuse an assertion whose email is not a string', () => {
    expect(verify(signAssertion({ payload: { email: 42 } })).isValid).toBe(
      false,
    );
  });

  it('should refuse a value that is not a JWT', () => {
    expect(verify('not-a-jwt')).toEqual({
      isValid: false,
      error: 'jwt malformed',
    });
  });
});
