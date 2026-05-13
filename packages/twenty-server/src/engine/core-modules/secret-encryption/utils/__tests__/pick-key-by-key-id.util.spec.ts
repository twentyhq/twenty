import { computeKeyId } from 'src/engine/core-modules/secret-encryption/utils/key-id.util';
import { pickKeyByKeyId } from 'src/engine/core-modules/secret-encryption/utils/pick-key-by-key-id.util';

describe('pickKeyByKeyId', () => {
  const PRIMARY = 'primary-key-1234567890abcdefghij';
  const FALLBACK = 'fallback-key-zyxwvutsrqponmlkjihgf';

  it('returns the primary key when its fingerprint matches', () => {
    const keyId = computeKeyId(PRIMARY);

    expect(pickKeyByKeyId(keyId, { primary: PRIMARY, fallback: null })).toBe(
      PRIMARY,
    );
  });

  it('returns the fallback key when its fingerprint matches', () => {
    const keyId = computeKeyId(FALLBACK);

    expect(
      pickKeyByKeyId(keyId, { primary: PRIMARY, fallback: FALLBACK }),
    ).toBe(FALLBACK);
  });

  it('prefers primary when both fingerprints would match (defensive)', () => {
    const keyId = computeKeyId(PRIMARY);

    expect(pickKeyByKeyId(keyId, { primary: PRIMARY, fallback: PRIMARY })).toBe(
      PRIMARY,
    );
  });

  it('throws an error naming the keyId when no configured key matches', () => {
    expect(() =>
      pickKeyByKeyId('deadbeef', { primary: PRIMARY, fallback: null }),
    ).toThrow(/No encryption key matches keyId 'deadbeef'/);
  });

  it('throws when fallback is null and primary does not match', () => {
    const unknownKeyId = computeKeyId('some-other-key');

    expect(() =>
      pickKeyByKeyId(unknownKeyId, { primary: PRIMARY, fallback: null }),
    ).toThrow(
      /Configure FALLBACK_ENCRYPTION_KEY with the key that encrypted this row/,
    );
  });

  it('throws when neither primary nor fallback fingerprint matches', () => {
    const unknownKeyId = computeKeyId('yet-another-key');

    expect(() =>
      pickKeyByKeyId(unknownKeyId, { primary: PRIMARY, fallback: FALLBACK }),
    ).toThrow(/No encryption key matches keyId/);
  });
});
