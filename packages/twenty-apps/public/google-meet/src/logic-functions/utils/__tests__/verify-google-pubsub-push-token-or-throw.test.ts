import { generateKeyPair, SignJWT } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { verifyGooglePubsubPushTokenOrThrow } from 'src/logic-functions/utils/verify-google-pubsub-push-token-or-throw.util';

const AUDIENCE = 'https://twenty.example.com/google-meet';
const SERVICE_ACCOUNT_EMAIL = 'google-meet-push@twenty.iam.gserviceaccount.com';

type PushTokenOverrides = {
  claims?: Record<string, string | boolean>;
  audience?: string;
  issuer?: string;
  expirationTime?: string;
  signingKey?: CryptoKey;
};

describe('verifyGooglePubsubPushTokenOrThrow', () => {
  let googleKeyPair: CryptoKeyPair;
  let otherKeyPair: CryptoKeyPair;

  beforeAll(async () => {
    googleKeyPair = await generateKeyPair('RS256');
    otherKeyPair = await generateKeyPair('RS256');
  });

  const signPushToken = ({
    claims,
    audience,
    issuer,
    expirationTime,
    signingKey,
  }: PushTokenOverrides) =>
    new SignJWT({
      email: SERVICE_ACCOUNT_EMAIL,
      email_verified: true,
      ...claims,
    })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(issuer ?? 'https://accounts.google.com')
      .setAudience(audience ?? AUDIENCE)
      .setIssuedAt()
      .setExpirationTime(expirationTime ?? '1h')
      .sign(signingKey ?? googleKeyPair.privateKey);

  const verifyPushToken = async (overrides: PushTokenOverrides) =>
    verifyGooglePubsubPushTokenOrThrow({
      authorizationHeader: `Bearer ${await signPushToken(overrides)}`,
      audience: AUDIENCE,
      serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
      getSigningKey: async () => googleKeyPair.publicKey,
    });

  it('should accept a token Google signed for the configured service account', async () => {
    await expect(verifyPushToken({})).resolves.toBeUndefined();
  });

  it('should refuse a request without bearer token', async () => {
    await expect(
      verifyGooglePubsubPushTokenOrThrow({
        authorizationHeader: undefined,
        audience: AUDIENCE,
        serviceAccountEmail: SERVICE_ACCOUNT_EMAIL,
        getSigningKey: async () => googleKeyPair.publicKey,
      }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse a token Google did not sign', async () => {
    await expect(
      verifyPushToken({ signingKey: otherKeyPair.privateKey }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse a token issued for another audience', async () => {
    await expect(
      verifyPushToken({ audience: 'https://other.example.com' }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse a token from another issuer', async () => {
    await expect(
      verifyPushToken({ issuer: 'https://issuer.example.com' }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse an expired token', async () => {
    await expect(
      verifyPushToken({ expirationTime: '-1h' }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse a token of another service account', async () => {
    await expect(
      verifyPushToken({
        claims: { email: 'other@twenty.iam.gserviceaccount.com' },
      }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });

  it('should refuse a token whose email is not verified', async () => {
    await expect(
      verifyPushToken({ claims: { email_verified: false } }),
    ).rejects.toMatchObject({ code: 'PUSH_TOKEN_INVALID' });
  });
});
