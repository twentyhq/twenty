import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SecretEncryptionExceptionCode {
  NO_ENCRYPTION_KEY_CONFIGURED = 'NO_ENCRYPTION_KEY_CONFIGURED',
  UNKNOWN_KEY_ID = 'UNKNOWN_KEY_ID',
  MALFORMED_ENVELOPE = 'MALFORMED_ENVELOPE',
  UNKNOWN_ENVELOPE_VERSION = 'UNKNOWN_ENVELOPE_VERSION',
  INVALID_KEY_ID_FORMAT = 'INVALID_KEY_ID_FORMAT',
  CIPHERTEXT_TOO_SHORT = 'CIPHERTEXT_TOO_SHORT',
  ALREADY_ENCRYPTED = 'ALREADY_ENCRYPTED',
}

const getSecretEncryptionExceptionUserFriendlyMessage = (
  code: SecretEncryptionExceptionCode,
) => {
  switch (code) {
    case SecretEncryptionExceptionCode.NO_ENCRYPTION_KEY_CONFIGURED:
    case SecretEncryptionExceptionCode.UNKNOWN_KEY_ID:
    case SecretEncryptionExceptionCode.MALFORMED_ENVELOPE:
    case SecretEncryptionExceptionCode.UNKNOWN_ENVELOPE_VERSION:
    case SecretEncryptionExceptionCode.INVALID_KEY_ID_FORMAT:
    case SecretEncryptionExceptionCode.CIPHERTEXT_TOO_SHORT:
    case SecretEncryptionExceptionCode.ALREADY_ENCRYPTED:
      return msg`An internal error occurred while handling encrypted data.`;
    default:
      assertUnreachable(code);
  }
};

export class SecretEncryptionException extends CustomException<SecretEncryptionExceptionCode> {
  constructor(
    message: string,
    code: SecretEncryptionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getSecretEncryptionExceptionUserFriendlyMessage(code),
    });
  }
}
