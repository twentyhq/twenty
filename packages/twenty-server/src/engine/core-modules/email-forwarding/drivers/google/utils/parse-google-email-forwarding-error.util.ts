import { type GaxiosError } from 'gaxios';
import { isDefined } from 'twenty-shared/utils';

import {
  EmailForwardingDriverException,
  EmailForwardingDriverExceptionCode,
} from 'src/engine/core-modules/email-forwarding/drivers/exceptions/email-forwarding-driver.exception';

export const parseGoogleEmailForwardingError = (
  error: GaxiosError,
  options?: { cause?: Error },
): EmailForwardingDriverException => {
  if (!isDefined(error.response)) {
    return new EmailForwardingDriverException(
      `Google Admin API transport error: ${error.message}`,
      EmailForwardingDriverExceptionCode.TEMPORARY_ERROR,
      options,
    );
  }

  const googleApiError = {
    code: error.response?.status,
    reason:
      error.response?.data?.error?.errors?.[0]?.reason ||
      error.response?.data?.error ||
      'Unknown reason',
    message:
      error.response?.data?.error?.errors?.[0]?.message ||
      error.response?.data?.error?.message ||
      'Unknown error',
  };

  switch (googleApiError.code) {
    case 400:
      if (googleApiError.message.toLowerCase().includes('domain')) {
        return new EmailForwardingDriverException(
          googleApiError.message,
          EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_DOMAIN_NOT_OWNED,
          options,
        );
      }

      return new EmailForwardingDriverException(
        googleApiError.message,
        EmailForwardingDriverExceptionCode.UNKNOWN,
        options,
      );

    case 401:
      return new EmailForwardingDriverException(
        googleApiError.message,
        EmailForwardingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );

    case 403:
      if (
        googleApiError.reason === 'rateLimitExceeded' ||
        googleApiError.reason === 'userRateLimitExceeded' ||
        googleApiError.reason === 'quotaExceeded'
      ) {
        return new EmailForwardingDriverException(
          googleApiError.message,
          EmailForwardingDriverExceptionCode.TEMPORARY_ERROR,
          options,
        );
      }

      return new EmailForwardingDriverException(
        `${googleApiError.message}. The connected Google account must be a Google Workspace administrator allowed to manage groups, and both the Admin SDK API and the Groups Settings API must be enabled for the OAuth project.`,
        EmailForwardingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        options,
      );

    case 409:
      return new EmailForwardingDriverException(
        googleApiError.message,
        EmailForwardingDriverExceptionCode.SOURCE_ADDRESS_UNAVAILABLE,
        options,
      );

    case 429:
    case 500:
    case 502:
    case 503:
    case 504:
      return new EmailForwardingDriverException(
        googleApiError.message,
        EmailForwardingDriverExceptionCode.TEMPORARY_ERROR,
        options,
      );

    default:
      return new EmailForwardingDriverException(
        googleApiError.message,
        EmailForwardingDriverExceptionCode.UNKNOWN,
        options,
      );
  }
};
