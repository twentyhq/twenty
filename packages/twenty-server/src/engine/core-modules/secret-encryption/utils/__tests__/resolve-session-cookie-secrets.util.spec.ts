import { createHash } from 'crypto';

import { deriveInstanceHmacKey } from 'src/engine/core-modules/secret-encryption/utils/derive-instance-hmac-key.util';
import { resolveSessionCookieSecretsOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-session-cookie-secrets.util';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

type EnvMap = Partial<{
  ENCRYPTION_KEY: string;
  FALLBACK_ENCRYPTION_KEY: string;
  APP_SECRET: string;
}>;

const buildConfig = (env: EnvMap): Pick<TwentyConfigService, 'get'> => ({
  get: jest.fn((key: keyof EnvMap) => env[key]) as never,
});

const hmacFor = (rawKey: string) =>
  deriveInstanceHmacKey({ rawKey, purpose: 'session-cookie' }).toString('hex');

const legacyAppSecretHash = (appSecret: string) =>
  createHash('sha256').update(`${appSecret}SESSION_STORE_SECRET`).digest('hex');

describe('resolveSessionCookieSecretsOrThrow', () => {
  it('throws when neither ENCRYPTION_KEY nor APP_SECRET is configured', () => {
    expect(() =>
      resolveSessionCookieSecretsOrThrow({
        twentyConfigService: buildConfig({}),
      }),
    ).toThrow(/ENCRYPTION_KEY/);
  });

  it('signs with ENCRYPTION_KEY first when set, with legacy APP_SECRET hash kept for verification', () => {
    const secrets = resolveSessionCookieSecretsOrThrow({
      twentyConfigService: buildConfig({
        ENCRYPTION_KEY: 'new-key',
        APP_SECRET: 'app',
      }),
    });

    expect(secrets[0]).toBe(hmacFor('new-key'));
    expect(secrets).toContain(legacyAppSecretHash('app'));
    expect(secrets).toHaveLength(2);
  });

  it('places FALLBACK_ENCRYPTION_KEY between the primary and the legacy slot', () => {
    const secrets = resolveSessionCookieSecretsOrThrow({
      twentyConfigService: buildConfig({
        ENCRYPTION_KEY: 'new-key',
        FALLBACK_ENCRYPTION_KEY: 'previous-key',
        APP_SECRET: 'app',
      }),
    });

    expect(secrets).toEqual([
      hmacFor('new-key'),
      hmacFor('previous-key'),
      legacyAppSecretHash('app'),
    ]);
  });

  it('omits the FALLBACK slot when FALLBACK_ENCRYPTION_KEY is empty', () => {
    const secrets = resolveSessionCookieSecretsOrThrow({
      twentyConfigService: buildConfig({
        ENCRYPTION_KEY: 'new-key',
        FALLBACK_ENCRYPTION_KEY: '',
        APP_SECRET: 'app',
      }),
    });

    expect(secrets).toEqual([hmacFor('new-key'), legacyAppSecretHash('app')]);
  });

  it('omits the legacy slot when APP_SECRET is unset', () => {
    const secrets = resolveSessionCookieSecretsOrThrow({
      twentyConfigService: buildConfig({ ENCRYPTION_KEY: 'new-key' }),
    });

    expect(secrets).toEqual([hmacFor('new-key')]);
  });

  it('falls back to HKDF(APP_SECRET) as primary when ENCRYPTION_KEY is unset, while keeping the legacy SHA slot', () => {
    const secrets = resolveSessionCookieSecretsOrThrow({
      twentyConfigService: buildConfig({ APP_SECRET: 'app' }),
    });

    expect(secrets).toEqual([hmacFor('app'), legacyAppSecretHash('app')]);
    expect(secrets[0]).not.toBe(secrets[1]);
  });

  it('derives different keys for different purposes (domain separation)', () => {
    const sessionCookieKey = deriveInstanceHmacKey({
      rawKey: 'same',
      purpose: 'session-cookie',
    });
    const otherPurposeKey = deriveInstanceHmacKey({
      rawKey: 'same',
      purpose: 'something-else',
    });

    expect(sessionCookieKey.equals(otherPurposeKey)).toBe(false);
  });
});
