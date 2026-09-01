import { isDefined } from 'twenty-shared/utils';

import { AWS_SES_CONFIGURATION_ERROR_NAMES } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-configuration-error-names.constant';
import { AWS_SES_INSUFFICIENT_PERMISSIONS_ERROR_NAMES } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-insufficient-permissions-error-names.constant';
import { AWS_SES_THROTTLING_AND_TRANSIENT_ERROR_NAMES } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-throttling-and-transient-error-names.constant';
import { type AwsSesError } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/aws-ses-error.type';
import { EmailingDomainDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

export const getAwsSesDriverExceptionCode = (
  error: AwsSesError,
): EmailingDomainDriverExceptionCode => {
  const name = error?.name ?? 'UnknownError';
  const httpStatus = error?.$metadata?.httpStatusCode;

  if (AWS_SES_THROTTLING_AND_TRANSIENT_ERROR_NAMES.includes(name)) {
    return EmailingDomainDriverExceptionCode.TEMPORARY_ERROR;
  }

  if (httpStatus === 429 || (isDefined(httpStatus) && httpStatus >= 500)) {
    return EmailingDomainDriverExceptionCode.TEMPORARY_ERROR;
  }

  if (
    httpStatus === 403 ||
    AWS_SES_INSUFFICIENT_PERMISSIONS_ERROR_NAMES.includes(name)
  ) {
    return EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS;
  }

  if (httpStatus === 400 || AWS_SES_CONFIGURATION_ERROR_NAMES.includes(name)) {
    return EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR;
  }

  return EmailingDomainDriverExceptionCode.UNKNOWN;
};
