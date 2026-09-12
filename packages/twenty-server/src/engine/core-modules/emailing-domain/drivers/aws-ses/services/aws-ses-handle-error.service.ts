import { Injectable } from '@nestjs/common';

import { type AwsSesError } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/aws-ses-error.type';
import { getAwsSesDriverExceptionCode } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/utils/get-aws-ses-driver-exception-code.util';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

@Injectable()
export class AwsSesHandleErrorService {
  public handleAwsSesError(error: AwsSesError, context?: string): never {
    const name = error?.name ?? 'UnknownError';
    const message = error?.message ?? 'No message';
    const suffix = context ? ` (${context})` : '';
    const code = getAwsSesDriverExceptionCode(error);

    switch (code) {
      case EmailingDomainDriverExceptionCode.TEMPORARY_ERROR:
        throw new EmailingDomainDriverException(
          `AWS SES temporary error${suffix}: ${message}`,
          code,
        );
      case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
        throw new EmailingDomainDriverException(
          `AWS SES insufficient permissions${suffix}: ${message}`,
          code,
        );
      case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
        throw new EmailingDomainDriverException(
          `AWS SES configuration error${suffix}: ${message}`,
          code,
        );
      default:
        throw new EmailingDomainDriverException(
          `AWS SES error${suffix}: ${name} - ${message}`,
          EmailingDomainDriverExceptionCode.UNKNOWN,
        );
    }
  }
}
