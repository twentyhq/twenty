import { generateKeyPairSync, type KeyObject } from 'crypto';

import { sign } from 'jsonwebtoken';

import { type ServerRouteSigningKey } from 'src/engine/core-modules/server-route-trigger/types/server-route-signing-key.type';
import { parseServerRouteSigningKeys } from 'src/engine/core-modules/server-route-trigger/utils/parse-server-route-signing-keys.util';
import { verifyServerRouteBearerToken } from 'src/engine/core-modules/server-route-trigger/utils/verify-server-route-bearer-token.util';

const ISSUER = 'https://api.example.com';
const AUDIENCE = 'bot-app-id';
const KEY_ID = 'key-1';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const toSigningKey = ({
  key = publicKey,
  endorsements = ['msteams'],
}: {
  key?: KeyObject;
  endorsements?: string[];
} = {}): ServerRouteSigningKey =>
  parseServerRouteSigningKeys({
    keys: [{ ...key.export({ format: 'jwk' }), kid: KEY_ID, endorsements }],
  })[0];

const signToken = ({
  key = privateKey,
  issuer = ISSUER,
  audience = AUDIENCE,
  expiresIn = '5m',
}: {
  key?: KeyObject;
  issuer?: string;
  audience?: string;
  expiresIn?: string;
} = {}) =>
  sign({ serviceurl: 'https://smba.trafficmanager.net/emea/' }, key, {
    algorithm: 'RS256',
    keyid: KEY_ID,
    issuer,
    audience,
    expiresIn,
  });

const encodeBase64Url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const verify = ({
  token,
  signingKey = toSigningKey(),
  requiredKeyEndorsement = 'msteams',
}: {
  token: string;
  signingKey?: ServerRouteSigningKey;
  requiredKeyEndorsement?: string;
}) =>
  verifyServerRouteBearerToken({
    token,
    signingKey,
    issuer: ISSUER,
    audience: AUDIENCE,
    requiredKeyEndorsement,
  });

describe('verifyServerRouteBearerToken', () => {
  it('should return the claims of a valid token', () => {
    expect(verify({ token: signToken() })).toEqual({
      isValid: true,
      claims: expect.objectContaining({
        iss: ISSUER,
        aud: AUDIENCE,
        serviceurl: 'https://smba.trafficmanager.net/emea/',
      }),
    });
  });

  it('should accept a token expired within the clock tolerance', () => {
    expect(verify({ token: signToken({ expiresIn: '-1m' }) })).toMatchObject({
      isValid: true,
    });
  });

  it('should not require an endorsement when none is configured', () => {
    expect(
      verifyServerRouteBearerToken({
        token: signToken(),
        signingKey: toSigningKey({ endorsements: [] }),
        issuer: ISSUER,
        audience: AUDIENCE,
      }),
    ).toMatchObject({ isValid: true });
  });

  it.each([
    ['a token for another audience', signToken({ audience: 'other' })],
    [
      'a token from another issuer',
      signToken({ issuer: 'https://evil.example.com' }),
    ],
    ['a token expired beyond the clock tolerance', signToken({ expiresIn: '-10m' })],
    [
      'a token signed by another key',
      signToken({
        key: generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey,
      }),
    ],
    [
      'an HS256 token signed with the public key',
      sign({ iss: ISSUER, aud: AUDIENCE }, publicKey.export({ type: 'spki', format: 'pem' }), {
        algorithm: 'HS256',
        keyid: KEY_ID,
        expiresIn: '5m',
      }),
    ],
    [
      'an unsigned token',
      `${encodeBase64Url({ alg: 'none', typ: 'JWT', kid: KEY_ID })}.${encodeBase64Url({ iss: ISSUER, aud: AUDIENCE })}.`,
    ],
  ])('should reject %s', (_, token) => {
    expect(verify({ token })).toMatchObject({ isValid: false });
  });

  it('should reject a token whose signing key lacks the required endorsement', () => {
    expect(
      verify({
        token: signToken(),
        signingKey: toSigningKey({ endorsements: ['webchat'] }),
      }),
    ).toEqual({
      isValid: false,
      reason: 'Bearer token signing key is not endorsed for msteams',
    });
  });
});
