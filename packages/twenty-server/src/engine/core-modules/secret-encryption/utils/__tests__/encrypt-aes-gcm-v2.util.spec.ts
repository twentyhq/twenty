import { decryptAesGcmV2OrThrow } from 'src/engine/core-modules/secret-encryption/utils/decrypt-aes-gcm-v2-or-throw.util';
import { encryptAesGcmV2 } from 'src/engine/core-modules/secret-encryption/utils/encrypt-aes-gcm-v2.util';

describe('encryptAesGcmV2', () => {
  const KEY = 'gcm-test-key-zzzz1234567890abcdefghijkl';

  it('produces a base64 payload that round-trips with workspaceId context', () => {
    const ciphertext = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });

    expect(
      decryptAesGcmV2OrThrow({
        payloadBase64: ciphertext,
        rawKey: KEY,
        workspaceId: 'ws-1',
      }),
    ).toBe('plaintext');
  });

  it('round-trips with no workspaceId (instance context)', () => {
    const ciphertext = encryptAesGcmV2({ plaintext: 'plaintext', rawKey: KEY });

    expect(
      decryptAesGcmV2OrThrow({ payloadBase64: ciphertext, rawKey: KEY }),
    ).toBe('plaintext');
  });

  it('produces a different ciphertext for the same plaintext under a different workspaceId', () => {
    const a = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });
    const b = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-2',
    });

    expect(a).not.toBe(b);
  });

  it('produces a different ciphertext on every call (random IV)', () => {
    const a = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });
    const b = encryptAesGcmV2({
      plaintext: 'plaintext',
      rawKey: KEY,
      workspaceId: 'ws-1',
    });

    expect(a).not.toBe(b);
  });

  it('handles unicode and long plaintexts', () => {
    const plaintext = 'secret-with-émojis-🔐-and-中文-' + 'a'.repeat(2000);
    const ciphertext = encryptAesGcmV2({
      plaintext,
      rawKey: KEY,
      workspaceId: 'ws-1',
    });

    expect(
      decryptAesGcmV2OrThrow({
        payloadBase64: ciphertext,
        rawKey: KEY,
        workspaceId: 'ws-1',
      }),
    ).toBe(plaintext);
  });
});
