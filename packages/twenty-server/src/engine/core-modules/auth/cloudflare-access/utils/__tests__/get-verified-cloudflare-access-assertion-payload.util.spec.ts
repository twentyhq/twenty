import { generateKeyPairSync } from 'crypto';

import * as jwt from 'jsonwebtoken';

import { getVerifiedCloudflareAccessAssertionPayload } from 'src/engine/core-modules/auth/cloudflare-access/utils/get-verified-cloudflare-access-assertion-payload.util';

const ISSUER = 'https://team.cloudflareaccess.com';
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
  expiresIn?: number;
} = {}) =>
  jwt.sign(payload, signingKey, { algorithm, issuer, audience, expiresIn });

const getPayload = (assertion: string) =>
  getVerifiedCloudflareAccessAssertionPayload({
    assertion,
    signingKey: publicKey,
    issuer: ISSUER,
    audience: AUDIENCE,
  });

describe('getVerifiedCloudflareAccessAssertionPayload', () => {
  it('should return the email of a valid assertion', () => {
    expect(getPayload(signAssertion())).toEqual({ email: 'jane@twenty.com' });
  });

  it('should return no email for a valid assertion without one', () => {
    expect(getPayload(signAssertion({ payload: {} }))).toEqual({});
  });

  it('should refuse an assertion for another audience', () => {
    expect(
      getPayload(signAssertion({ audience: 'another-audience' })),
    ).toBeUndefined();
  });

  it('should refuse an assertion from another issuer', () => {
    expect(
      getPayload(
        signAssertion({ issuer: 'https://another-team.cloudflareaccess.com' }),
      ),
    ).toBeUndefined();
  });

  it('should refuse an expired assertion', () => {
    expect(getPayload(signAssertion({ expiresIn: -60 }))).toBeUndefined();
  });

  it('should refuse an assertion signed by another key', () => {
    const { privateKey: anotherPrivateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    expect(
      getPayload(signAssertion({ signingKey: anotherPrivateKey })),
    ).toBeUndefined();
  });

  it('should refuse an assertion signed with the public key as a shared secret', () => {
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });

    expect(
      getPayload(
        signAssertion({ signingKey: publicKeyPem, algorithm: 'HS256' }),
      ),
    ).toBeUndefined();
  });

  it('should refuse an assertion whose email is not a string', () => {
    expect(
      getPayload(signAssertion({ payload: { email: 42 } })),
    ).toBeUndefined();
  });

  it('should refuse a value that is not a JWT', () => {
    expect(getPayload('not-a-jwt')).toBeUndefined();
  });
});
