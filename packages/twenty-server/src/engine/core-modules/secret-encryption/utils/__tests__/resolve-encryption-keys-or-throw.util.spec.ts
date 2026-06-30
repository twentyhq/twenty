import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { resolveEncryptionKeysOrThrow } from 'src/engine/core-modules/secret-encryption/utils/resolve-encryption-keys-or-throw.util';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

type EnvMap = Partial<{
  ENCRYPTION_KEY: string;
  FALLBACK_ENCRYPTION_KEY: string;
  APP_SECRET: string;
}>;

const buildDriver = (env: EnvMap): Pick<EnvironmentConfigDriver, 'get'> => ({
  get: jest.fn((key: keyof EnvMap) => env[key]) as never,
});

describe('resolveEncryptionKeysOrThrow', () => {
  it('throws NO_ENCRYPTION_KEY_CONFIGURED when no key is set', () => {
    expect(() =>
      resolveEncryptionKeysOrThrow({
        environmentConfigDriver: buildDriver({}),
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.NO_ENCRYPTION_KEY_CONFIGURED,
      }) as SecretEncryptionException,
    );
  });

  it('uses APP_SECRET as primary when ENCRYPTION_KEY is unset', () => {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: buildDriver({ APP_SECRET: 'app' }),
    });

    expect(keys.primary).toBe('app');
    expect(keys.fallback).toBeNull();
  });

  it('prefers ENCRYPTION_KEY over APP_SECRET when both are set', () => {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: buildDriver({
        ENCRYPTION_KEY: 'new',
        APP_SECRET: 'old',
      }),
    });

    expect(keys.primary).toBe('new');
  });

  it('exposes FALLBACK_ENCRYPTION_KEY when set', () => {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: buildDriver({
        ENCRYPTION_KEY: 'new',
        FALLBACK_ENCRYPTION_KEY: 'old',
      }),
    });

    expect(keys.primary).toBe('new');
    expect(keys.fallback).toBe('old');
  });

  it('returns null fallback when FALLBACK_ENCRYPTION_KEY is unset', () => {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: buildDriver({ ENCRYPTION_KEY: 'new' }),
    });

    expect(keys.fallback).toBeNull();
  });

  it('treats empty-string env vars as unset', () => {
    const keys = resolveEncryptionKeysOrThrow({
      environmentConfigDriver: buildDriver({
        ENCRYPTION_KEY: '',
        APP_SECRET: 'app',
        FALLBACK_ENCRYPTION_KEY: '',
      }),
    });

    expect(keys.primary).toBe('app');
    expect(keys.fallback).toBeNull();
  });
});
