import { isDefined } from 'twenty-shared/utils';

import { type AwsSesError } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/aws-ses-error.type';
import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

const THROTTLING_AND_TRANSIENT_ERROR_NAMES = [
  'ThrottlingException',
  'Throttling',
  'TooManyRequestsException',
  'LimitExceededException',
  'ServiceUnavailable',
  'InternalFailure',
  'RequestTimeout',
];

const INSUFFICIENT_PERMISSIONS_ERROR_NAMES = [
  'AccessDeniedException',
  'AccountSuspendedException',
];

const CONFIGURATION_ERROR_NAMES = [
  'InvalidParameterValue',
  'InvalidParameterCombination',
  'MissingParameter',
  'MessageRejected',
  'MailFromDomainNotVerifiedException',
  'FromEmailAddressNotVerifiedException',
];

export const getAwsSesDriverExceptionCode = (
  error: AwsSesError,
): EmailingDomainDriverExceptionCode => {
  const name = error?.name ?? 'UnknownError';
  const httpStatus = error?.$metadata?.httpStatusCode;

  if (THROTTLING_AND_TRANSIENT_ERROR_NAMES.includes(name)) {
    return EmailingDomainDriverExceptionCode.TEMPORARY_ERROR;
  }

  if (httpStatus === 429 || (isDefined(httpStatus) && httpStatus >= 500)) {
    return EmailingDomainDriverExceptionCode.TEMPORARY_ERROR;
  }

  if (
    httpStatus === 403 ||
    INSUFFICIENT_PERMISSIONS_ERROR_NAMES.includes(name)
  ) {
    return EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS;
  }

  if (httpStatus === 400 || CONFIGURATION_ERROR_NAMES.includes(name)) {
    return EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR;
  }

  return EmailingDomainDriverExceptionCode.UNKNOWN;
};
