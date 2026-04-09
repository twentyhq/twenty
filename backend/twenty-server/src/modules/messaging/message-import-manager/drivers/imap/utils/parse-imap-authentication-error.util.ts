import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';
import { isImapNetworkError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-network-error.util';

export const parseImapAuthenticationError = (
  error: ImapFlowError,
): MessageImportDriverException => {
  if (isImapNetworkError(error)) {
    return new MessageImportDriverException(
      `IMAP network error: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: error },
    );
  }

  if (error.authenticationFailed === true) {
    return new MessageImportDriverException(
      `IMAP authentication error: ${error.message}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: error },
    );
  }

  return new MessageImportDriverException(
    `Unknown IMAP authentication error: ${error.message}`,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: error },
  );
};
