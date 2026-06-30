import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { formatSecretEncryptionEnvelopeV2 } from 'src/engine/core-modules/secret-encryption/utils/format-secret-encryption-envelope-v2.util';
import { parseSecretEncryptionEnvelopeOrThrow } from 'src/engine/core-modules/secret-encryption/utils/parse-secret-encryption-envelope-or-throw.util';

describe('formatSecretEncryptionEnvelopeV2', () => {
  it('concatenates the v2 prefix, keyId, and payload', () => {
    expect(
      formatSecretEncryptionEnvelopeV2({
        keyId: 'abcd1234',
        payloadBase64: 'payload',
      }),
    ).toBe(`${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}abcd1234:payload`);
  });

  it('round-trips with parseSecretEncryptionEnvelopeOrThrow', () => {
    const envelope = formatSecretEncryptionEnvelopeV2({
      keyId: 'deadbeef',
      payloadBase64: 'cipherpayload',
    });
    const parsed = parseSecretEncryptionEnvelopeOrThrow({ value: envelope });

    expect(parsed).toEqual({
      version: 2,
      keyId: 'deadbeef',
      payload: 'cipherpayload',
    });
  });
});
