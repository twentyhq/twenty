import { type GraphError } from '@microsoft/microsoft-graph-client';

import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';

export const parseMicrosoftEmailForwardingError = (
  error: GraphError,
): EmailForwardingDriverException => {
  const { statusCode, code, message } = error;

  if (statusCode === 401 || statusCode === 403) {
    return new EmailForwardingDriverException(
      `Microsoft Graph refused the request (${code}): ${message}. The connected account must be a Microsoft 365 administrator.`,
      EmailForwardingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: error },
    );
  }

  if (statusCode === 409) {
    return new EmailForwardingDriverException(
      message,
      EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_UNAVAILABLE,
      { cause: error },
    );
  }

  if (statusCode === 400) {
    return new EmailForwardingDriverException(
      message,
      EmailForwardingDriverExceptionCode.UNKNOWN,
      { cause: error },
    );
  }

  return new EmailForwardingDriverException(
    `Microsoft Graph API ${code} ${statusCode} error: ${message}`,
    EmailForwardingDriverExceptionCode.TEMPORARY_ERROR,
    { cause: error },
  );
};
