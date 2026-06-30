import { Injectable } from '@nestjs/common';

import { type AwsSesError } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/types/aws-ses-error.type';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

@Injectable()
export class AwsSesHandleErrorService {
  public handleAwsSesError(error: AwsSesError, context?: string): never {
    const name = error?.name ?? 'UnknownError';
    const message = error?.message ?? 'No message';
    const httpStatus = error?.$metadata?.httpStatusCode;
    const suffix = context ? ` (${context})` : '';

    if (this.isTemporary(name, httpStatus)) {
      throw new EmailingDomainDriverException(
        `AWS SES temporary error${suffix}: ${message}`,
        EmailingDomainDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    if (this.isInsufficientPermissions(name, httpStatus)) {
      throw new EmailingDomainDriverException(
        `AWS SES insufficient permissions${suffix}: ${message}`,
        EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (this.isConfigurationError(name, httpStatus)) {
      throw new EmailingDomainDriverException(
        `AWS SES configuration error${suffix}: ${message}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    throw new EmailingDomainDriverException(
      `AWS SES error${suffix}: ${name} - ${message}`,
      EmailingDomainDriverExceptionCode.UNKNOWN,
    );
  }

  private isTemporary(name: string, httpStatus?: number): boolean {
    if (httpStatus && httpStatus >= 500) {
      return true;
    }

    if (
      name === 'ThrottlingException' ||
      name === 'ServiceUnavailable' ||
      name === 'InternalFailure' ||
      name === 'RequestTimeout' ||
      name === 'TooManyRequestsException'
    ) {
      return true;
    }

    return false;
  }

  private isInsufficientPermissions(
    name: string,
    httpStatus?: number,
  ): boolean {
    if (httpStatus === 403) {
      return true;
    }

    if (
      name === 'AccessDeniedException' ||
      name === 'AccountSuspendedException'
    ) {
      return true;
    }

    return false;
  }

  private isConfigurationError(name: string, httpStatus?: number): boolean {
    if (httpStatus === 400) {
      return true;
    }

    if (
      name === 'InvalidParameterValue' ||
      name === 'InvalidParameterCombination' ||
      name === 'MissingParameter' ||
      name === 'MessageRejected' ||
      name === 'MailFromDomainNotVerifiedException' ||
      name === 'FromEmailAddressNotVerifiedException'
    ) {
      return true;
    }

    return false;
  }
}
