import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { computeEncryptionKeyId } from 'src/engine/core-modules/secret-encryption/utils/compute-encryption-key-id.util';
import { pickEncryptionKeyByKeyIdOrThrow } from 'src/engine/core-modules/secret-encryption/utils/pick-encryption-key-by-key-id-or-throw.util';

describe('pickEncryptionKeyByKeyIdOrThrow', () => {
  const PRIMARY = 'primary-key-1234567890abcdefghij';
  const FALLBACK = 'fallback-key-zyxwvutsrqponmlkjihgf';

  it('returns the primary key when its fingerprint matches', () => {
    const keyId = computeEncryptionKeyId({ rawKey: PRIMARY });

    expect(
      pickEncryptionKeyByKeyIdOrThrow({
        keyId,
        keys: { primary: PRIMARY, fallback: null },
      }),
    ).toBe(PRIMARY);
  });

  it('returns the fallback key when its fingerprint matches', () => {
    const keyId = computeEncryptionKeyId({ rawKey: FALLBACK });

    expect(
      pickEncryptionKeyByKeyIdOrThrow({
        keyId,
        keys: { primary: PRIMARY, fallback: FALLBACK },
      }),
    ).toBe(FALLBACK);
  });

  it('prefers primary when both fingerprints would match', () => {
    const keyId = computeEncryptionKeyId({ rawKey: PRIMARY });

    expect(
      pickEncryptionKeyByKeyIdOrThrow({
        keyId,
        keys: { primary: PRIMARY, fallback: PRIMARY },
      }),
    ).toBe(PRIMARY);
  });

  it('throws UNKNOWN_KEY_ID when no configured key matches', () => {
    expect(() =>
      pickEncryptionKeyByKeyIdOrThrow({
        keyId: 'deadbeef',
        keys: { primary: PRIMARY, fallback: null },
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.UNKNOWN_KEY_ID,
      }) as SecretEncryptionException,
    );
  });

  it('error message names the missing keyId for operator diagnostics', () => {
    expect(() =>
      pickEncryptionKeyByKeyIdOrThrow({
        keyId: 'deadbeef',
        keys: { primary: PRIMARY, fallback: null },
      }),
    ).toThrow(/keyId 'deadbeef'/);
  });
});
