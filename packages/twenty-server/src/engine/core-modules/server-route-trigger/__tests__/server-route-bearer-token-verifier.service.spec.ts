import { generateKeyPairSync, type KeyObject } from 'crypto';

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { sign } from 'jsonwebtoken';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { ServerRouteTriggerExceptionCode } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { ServerRouteBearerTokenVerifierService } from 'src/engine/core-modules/server-route-trigger/server-route-bearer-token-verifier.service';

const JWKS_URL = 'https://login.example.com/keys';
const ISSUER = 'https://api.example.com';
const AUDIENCE = 'bot-app-id';
const KEY_ID = 'key-1';

const BEARER_TOKEN_VERIFICATION = {
  jwksUrl: JWKS_URL,
  issuer: ISSUER,
  audienceServerVariable: 'BOT_APP_ID',
  requiredKeyEndorsement: 'msteams',
};

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const buildPublishedKey = ({
  kid = KEY_ID,
  key = publicKey,
  endorsements = ['msteams'],
}: {
  kid?: string;
  key?: KeyObject;
  endorsements?: string[];
} = {}) => ({
  ...key.export({ format: 'jwk' }),
  kid,
  use: 'sig',
  endorsements,
});

const signToken = ({
  audience = AUDIENCE,
  keyid = KEY_ID,
}: { audience?: string; keyid?: string } = {}) =>
  sign({ serviceurl: 'https://smba.trafficmanager.net/emea/' }, privateKey, {
    algorithm: 'RS256',
    issuer: ISSUER,
    audience,
    keyid,
    expiresIn: '5m',
  });

describe('ServerRouteBearerTokenVerifierService', () => {
  let service: ServerRouteBearerTokenVerifierService;
  let fetchJwks: jest.Mock;
  let findVariable: jest.Mock;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    fetchJwks = jest
      .fn()
      .mockResolvedValue({ data: { keys: [buildPublishedKey()] } });
    findVariable = jest.fn().mockResolvedValue({ encryptedValue: AUDIENCE });

    const module = await Test.createTestingModule({
      providers: [
        ServerRouteBearerTokenVerifierService,
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: { findOne: findVariable },
        },
        {
          provide: SecretEncryptionService,
          useValue: { decryptVersionedOrThrow: (value: string) => value },
        },
        {
          provide: SecureHttpClientService,
          useValue: { getHttpClient: () => ({ get: fetchJwks }) },
        },
      ],
    }).compile();

    service = module.get(ServerRouteBearerTokenVerifierService);
  });

  const verify = (authorizationHeader: string | undefined) =>
    service.verifyOrThrow({
      authorizationHeader,
      bearerTokenVerification: BEARER_TOKEN_VERIFICATION,
      applicationRegistrationId: 'registration-id',
    });

  it('should return the claims of a valid token', async () => {
    const claims = await verify(`Bearer ${signToken()}`);

    expect(claims).toMatchObject({
      iss: ISSUER,
      aud: AUDIENCE,
      serviceurl: 'https://smba.trafficmanager.net/emea/',
    });
    expect(findVariable).toHaveBeenCalledWith({
      where: {
        applicationRegistrationId: 'registration-id',
        key: 'BOT_APP_ID',
      },
    });
  });

  it('should reuse fetched signing keys across requests', async () => {
    await verify(`Bearer ${signToken()}`);
    await verify(`Bearer ${signToken()}`);

    expect(fetchJwks).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['a missing header', undefined],
    ['a non bearer scheme', `Basic ${signToken()}`],
    [
      'a token for another audience',
      `Bearer ${signToken({ audience: 'other' })}`,
    ],
  ])('should reject %s', async (_, authorizationHeader) => {
    await expect(verify(authorizationHeader)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
      message: 'Bearer token is invalid',
    });
  });

  it('should reject a token signed by a key published under its key id by someone else', async () => {
    const { publicKey: otherPublicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    fetchJwks.mockResolvedValue({
      data: { keys: [buildPublishedKey({ key: otherPublicKey })] },
    });

    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
    });
  });

  it('should reject a token whose signing key lacks the required endorsement', async () => {
    fetchJwks.mockResolvedValue({
      data: { keys: [buildPublishedKey({ endorsements: ['webchat'] })] },
    });

    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
    });
  });

  it('should not refetch signing keys for an unknown key id right after a fetch', async () => {
    await expect(
      verify(`Bearer ${signToken({ keyid: 'unknown-key' })}`),
    ).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.INVALID_BEARER_TOKEN,
    });
    expect(fetchJwks).toHaveBeenCalledTimes(1);
  });

  it('should share one signing keys fetch across concurrent requests', async () => {
    await Promise.all([
      verify(`Bearer ${signToken()}`),
      verify(`Bearer ${signToken()}`),
      verify(`Bearer ${signToken()}`),
    ]);

    expect(fetchJwks).toHaveBeenCalledTimes(1);
  });

  it('should not retry a failed signing keys fetch right away', async () => {
    fetchJwks.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
    });
    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
    });
    expect(fetchJwks).toHaveBeenCalledTimes(1);
  });

  it('should keep the cached signing keys when a refresh returns no usable key', async () => {
    await verify(`Bearer ${signToken()}`);

    const nowMs = Date.now();

    jest.spyOn(Date, 'now').mockReturnValue(nowMs + 25 * 60 * 60 * 1000);
    fetchJwks.mockResolvedValue({ data: { keys: [] } });

    await expect(verify(`Bearer ${signToken()}`)).resolves.toMatchObject({
      aud: AUDIENCE,
    });
    expect(fetchJwks).toHaveBeenCalledTimes(2);
  });

  it('should be unavailable when the audience server variable is not set', async () => {
    findVariable.mockResolvedValue({ encryptedValue: '' });

    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
    });
  });

  it('should be unavailable when the signing keys cannot be fetched', async () => {
    fetchJwks.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(verify(`Bearer ${signToken()}`)).rejects.toMatchObject({
      code: ServerRouteTriggerExceptionCode.BEARER_TOKEN_VERIFICATION_UNAVAILABLE,
      message: 'Bearer token verification is unavailable',
    });
  });
});
