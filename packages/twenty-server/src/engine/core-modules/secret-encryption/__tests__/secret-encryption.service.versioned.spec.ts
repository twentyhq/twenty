import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { encryptAesCtrV1 } from 'src/engine/core-modules/secret-encryption/utils/aes-ctr-v1.util';
import {
  ENVELOPE_V1_PREFIX,
  ENVELOPE_V2_PREFIX,
} from 'src/engine/core-modules/secret-encryption/utils/envelope.util';
import { computeKeyId } from 'src/engine/core-modules/secret-encryption/utils/key-id.util';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

type EnvMap = Partial<{
  ENCRYPTION_KEY: string;
  FALLBACK_ENCRYPTION_KEY: string;
  APP_SECRET: string;
}>;

const buildService = (env: EnvMap): SecretEncryptionService => {
  const driver = {
    get: jest.fn((key: keyof EnvMap) => env[key]),
  } as unknown as EnvironmentConfigDriver;

  return new SecretEncryptionService(driver);
};

describe('SecretEncryptionService — versioned envelope and key resolution', () => {
  const APP_SECRET = 'legacy-app-secret-9b8c7d6e5f4a3b2c1d0e9f8a';
  const NEW_KEY = 'new-encryption-key-1234567890abcdefghij';
  const OLD_KEY = 'old-encryption-key-zyxwvutsrqponmlkjihgf';

  describe('key resolution', () => {
    it('should throw when no key is configured at all', () => {
      const service = buildService({});

      expect(() => service.encrypt('value')).toThrow(
        /No encryption key configured/,
      );
    });

    it('should resolve primary to APP_SECRET when ENCRYPTION_KEY is unset', () => {
      const service = buildService({ APP_SECRET });
      const ciphertext = service.encrypt('value');

      // Bit-for-bit compatible with the pre-rotation deployment shape:
      // encryptAesCtrV1(value, APP_SECRET) produces the same kind of output.
      expect(typeof ciphertext).toBe('string');
      expect(ciphertext).not.toContain('value');
      expect(service.decrypt(ciphertext)).toBe('value');
    });

    it('should prefer ENCRYPTION_KEY over APP_SECRET when both are set', () => {
      const dual = buildService({ APP_SECRET, ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = dual.encrypt('value');

      // Decrypting that ciphertext with APP_SECRET only must NOT yield 'value'.
      const appSecretOnly = buildService({ APP_SECRET });

      expect(dual.decrypt(ciphertext)).toBe('value');
      expect(appSecretOnly.decrypt(ciphertext)).not.toBe('value');
    });
  });

  describe('encryptVersioned and decryptVersioned (v2 round-trip)', () => {
    it('should produce enc:v2:<8 hex>:<base64> format', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = service.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      expect(ciphertext).toMatch(
        new RegExp(`^${ENVELOPE_V2_PREFIX}[0-9a-f]{8}:[A-Za-z0-9+/=]+$`),
      );
    });

    it('should embed the SHA-256-derived keyId of the primary key', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = service.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });
      const [, , keyIdAndPayload] = ciphertext.split(':');
      const keyId = keyIdAndPayload;

      expect(keyId).toBe(computeKeyId(NEW_KEY));
    });

    it('should round-trip with workspaceId bound into the derivation', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const plaintext = 'secret-token-abc';

      const ciphertext = service.encryptVersioned(plaintext, {
        workspaceId: 'ws-1',
      });

      expect(
        service.decryptVersioned(ciphertext, { workspaceId: 'ws-1' }),
      ).toBe(plaintext);
    });

    it('should round-trip with no workspaceId (instance context)', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });

      const ciphertext = service.encryptVersioned('instance-value');

      expect(service.decryptVersioned(ciphertext)).toBe('instance-value');
    });

    it('should fail (GCM auth tag) when decrypting with a different workspaceId', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = service.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      expect(() =>
        service.decryptVersioned(ciphertext, { workspaceId: 'ws-2' }),
      ).toThrow();
    });

    it('should fail (GCM auth tag) when the ciphertext payload is tampered', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = service.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      // Flip the very last character of the base64 payload.
      const tampered =
        ciphertext.slice(0, -1) + (ciphertext.endsWith('A') ? 'B' : 'A');

      expect(() =>
        service.decryptVersioned(tampered, { workspaceId: 'ws-1' }),
      ).toThrow();
    });
  });

  describe('decryptVersioned key resolution by keyId', () => {
    it('should route to the primary when keyId matches it', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });
      const ciphertext = service.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      // Sanity: this works without fallback configured.
      expect(
        service.decryptVersioned(ciphertext, { workspaceId: 'ws-1' }),
      ).toBe('payload');
    });

    it('should route to the fallback when keyId matches it (rotation scenario)', () => {
      // Step 1: encrypt with the "old" key.
      const oldService = buildService({ ENCRYPTION_KEY: OLD_KEY });
      const ciphertext = oldService.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      // Step 2: rotate — primary is now NEW_KEY, OLD_KEY is the fallback.
      const rotatedService = buildService({
        ENCRYPTION_KEY: NEW_KEY,
        FALLBACK_ENCRYPTION_KEY: OLD_KEY,
      });

      expect(
        rotatedService.decryptVersioned(ciphertext, { workspaceId: 'ws-1' }),
      ).toBe('payload');
    });

    it('should throw an informative error naming the missing keyId when no key matches', () => {
      const oldService = buildService({ ENCRYPTION_KEY: OLD_KEY });
      const ciphertext = oldService.encryptVersioned('payload', {
        workspaceId: 'ws-1',
      });

      const oldKeyId = computeKeyId(OLD_KEY);

      const newService = buildService({ ENCRYPTION_KEY: NEW_KEY });

      expect(() =>
        newService.decryptVersioned(ciphertext, { workspaceId: 'ws-1' }),
      ).toThrow(new RegExp(`No encryption key matches keyId '${oldKeyId}'`));
    });
  });

  describe('decryptVersioned legacy paths', () => {
    it('should decrypt a v1 (legacy CTR) envelope with the primary key', () => {
      // Pretend an old connected-account row was written by the previous
      // implementation: enc:v1:<base64 CTR ciphertext encrypted with APP_SECRET>.
      const legacyPayload = encryptAesCtrV1('legacy-token', APP_SECRET);
      const v1Row = `${ENVELOPE_V1_PREFIX}${legacyPayload}`;

      const service = buildService({ APP_SECRET });

      expect(service.decryptVersioned(v1Row)).toBe('legacy-token');
    });

    it('should decrypt a no-prefix legacy CTR value via the legacy decrypt path', () => {
      const service = buildService({ APP_SECRET });
      const ciphertext = service.encrypt('legacy-no-prefix');

      expect(service.decryptVersioned(ciphertext)).toBe('legacy-no-prefix');
    });

    it('should throw on a malformed envelope (unknown version)', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });

      expect(() => service.decryptVersioned('enc:v99:nonsense')).toThrow(
        /Unknown ciphertext envelope version/,
      );
    });

    it('should throw on a malformed v2 envelope (missing keyId separator)', () => {
      const service = buildService({ ENCRYPTION_KEY: NEW_KEY });

      expect(() =>
        service.decryptVersioned(`${ENVELOPE_V2_PREFIX}no-separator`),
      ).toThrow(/Malformed enc:v2 envelope/);
    });
  });

  describe('legacy encrypt / decrypt API', () => {
    it('should produce a base64 (unprefixed) ciphertext compatible with the existing wire format', () => {
      const service = buildService({ APP_SECRET });
      const ciphertext = service.encrypt('value');

      expect(ciphertext).not.toMatch(/^enc:/);
      // base64 alphabet only
      expect(ciphertext).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
      expect(service.decrypt(ciphertext)).toBe('value');
    });

    it('should pass undefined/null through unchanged', () => {
      const service = buildService({ APP_SECRET });

      expect(service.encrypt(undefined as unknown as string)).toBeUndefined();
      expect(service.encrypt(null as unknown as string)).toBeNull();
      expect(service.decrypt(undefined as unknown as string)).toBeUndefined();
      expect(service.decrypt(null as unknown as string)).toBeNull();
    });
  });
});
