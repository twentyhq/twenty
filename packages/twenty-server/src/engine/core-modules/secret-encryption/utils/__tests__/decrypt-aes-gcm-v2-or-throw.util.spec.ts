import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { decryptAesGcmV2OrThrow } from 'src/engine/core-modules/secret-encryption/utils/decrypt-aes-gcm-v2-or-throw.util';
import { encryptAesGcmV2 } from 'src/engine/core-modules/secret-encryption/utils/encrypt-aes-gcm-v2.util';

describe('decryptAesGcmV2OrThrow', () => {
  const KEY = 'gcm-test-key-zzzz1234567890abcdefghijkl';

  it('throws when decrypting with a different workspaceId (HKDF context binding)', () => {
    const ciphertext = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });

    expect(() =>
      decryptAesGcmV2OrThrow({
        payloadBase64: ciphertext,
        rawKey: KEY,
        workspaceId: 'ws-2',
      }),
    ).toThrow();
  });

  it('throws when decrypting with a different key', () => {
    const ciphertext = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });

    expect(() =>
      decryptAesGcmV2OrThrow({
        payloadBase64: ciphertext,
        rawKey: 'wrong-key',
        workspaceId: 'ws-1',
      }),
    ).toThrow();
  });

  it('throws when the ciphertext payload has been tampered with (GCM auth tag)', () => {
    const ciphertext = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });
    // Base64 alphabet collisions and padding can make a 1-char flip a no-op.
    // Decode, flip one byte in the middle, re-encode.
    const buffer = Buffer.from(ciphertext, 'base64');
    const middle = Math.floor(buffer.length / 2);

    buffer[middle] = buffer[middle] ^ 0xff;
    const tampered = buffer.toString('base64');

    expect(() =>
      decryptAesGcmV2OrThrow({
        payloadBase64: tampered,
        rawKey: KEY,
        workspaceId: 'ws-1',
      }),
    ).toThrow();
  });

  it('throws CIPHERTEXT_TOO_SHORT on a payload that cannot contain IV + tag', () => {
    expect(() =>
      decryptAesGcmV2OrThrow({
        payloadBase64: 'AAAA',
        rawKey: KEY,
        workspaceId: 'ws-1',
      }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.CIPHERTEXT_TOO_SHORT,
      }) as SecretEncryptionException,
    );
  });
});
