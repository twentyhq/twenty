import {
  decryptAesGcmV2,
  encryptAesGcmV2,
} from 'src/engine/core-modules/secret-encryption/utils/aes-gcm-v2.util';

describe('aes-gcm-v2', () => {
  const KEY = 'gcm-test-key-zzzz1234567890abcdefghijkl';

  it('round-trips a plaintext with a workspaceId context', () => {
    const ciphertext = encryptAesGcmV2('plaintext', KEY, 'ws-1');

    expect(decryptAesGcmV2(ciphertext, KEY, 'ws-1')).toBe('plaintext');
  });

  it('round-trips a plaintext with no workspaceId (instance context)', () => {
    const ciphertext = encryptAesGcmV2('plaintext', KEY);

    expect(decryptAesGcmV2(ciphertext, KEY)).toBe('plaintext');
  });

  it('produces a different ciphertext for the same plaintext under a different workspaceId', () => {
    const a = encryptAesGcmV2('plaintext', KEY, 'ws-1');
    const b = encryptAesGcmV2('plaintext', KEY, 'ws-2');

    expect(a).not.toBe(b);
  });

  it('produces a different ciphertext on every call (random IV)', () => {
    const a = encryptAesGcmV2('plaintext', KEY, 'ws-1');
    const b = encryptAesGcmV2('plaintext', KEY, 'ws-1');

    expect(a).not.toBe(b);
  });

  it('throws when decrypting with a different workspaceId (HKDF context binding)', () => {
    const ciphertext = encryptAesGcmV2('plaintext', KEY, 'ws-1');

    expect(() => decryptAesGcmV2(ciphertext, KEY, 'ws-2')).toThrow();
  });

  it('throws when decrypting with a different key', () => {
    const ciphertext = encryptAesGcmV2('plaintext', KEY, 'ws-1');

    expect(() => decryptAesGcmV2(ciphertext, 'wrong-key', 'ws-1')).toThrow();
  });

  it('throws when the ciphertext payload has been tampered with (GCM auth tag)', () => {
    const ciphertext = encryptAesGcmV2('plaintext', KEY, 'ws-1');
    // Decode → flip one byte in the middle of the buffer → re-encode.
    // Flipping a single base64 character isn't reliable because base64
    // alphabet collisions and padding can yield the same decoded bytes.
    const buffer = Buffer.from(ciphertext, 'base64');
    const middle = Math.floor(buffer.length / 2);

    buffer[middle] = buffer[middle] ^ 0xff;
    const tampered = buffer.toString('base64');

    expect(() => decryptAesGcmV2(tampered, KEY, 'ws-1')).toThrow();
  });

  it('throws on a payload that is too short to contain IV + tag', () => {
    expect(() => decryptAesGcmV2('AAAA', KEY, 'ws-1')).toThrow(
      /v2 ciphertext payload is too short/,
    );
  });

  it('handles unicode and long plaintexts', () => {
    const plaintext = 'secret-with-émojis-🔐-and-中文-' + 'a'.repeat(2000);
    const ciphertext = encryptAesGcmV2(plaintext, KEY, 'ws-1');

    expect(decryptAesGcmV2(ciphertext, KEY, 'ws-1')).toBe(plaintext);
  });
});
