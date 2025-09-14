import { Injectable } from '@nestjs/common';

import {
  OutboundMessageDomainDriverException,
  OutboundMessageDomainDriverExceptionCode,
} from 'src/engine/core-modules/outbound-message-domain/drivers/exceptions/outbound-message-domain-driver.exception';

interface AwsSesError {
  name?: string;
  message?: string;
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
  };
}

@Injectable()
export class AwsSesHandleErrorService {
  public handleAwsSesError(error: AwsSesError, context?: string): never {
    const name = error?.name ?? 'UnknownError';
    const message = error?.message ?? 'No message';
    const httpStatus = error?.$metadata?.httpStatusCode;
    const suffix = context ? ` (${context})` : '';

    if (this.isTemporary(name, httpStatus)) {
      throw new OutboundMessageDomainDriverException(
        `AWS SES temporary error${suffix}: ${message}`,
        OutboundMessageDomainDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    if (this.isInsufficientPermissions(name, httpStatus)) {
      throw new OutboundMessageDomainDriverException(
        `AWS SES insufficient permissions${suffix}: ${message}`,
        OutboundMessageDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (this.isConfigurationError(name, httpStatus)) {
      throw new OutboundMessageDomainDriverException(
        `AWS SES configuration error${suffix}: ${message}`,
        OutboundMessageDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    throw new OutboundMessageDomainDriverException(
      `AWS SES error${suffix}: ${name} - ${message}`,
      OutboundMessageDomainDriverExceptionCode.UNKNOWN,
    );
  }

  private isTemporary(name: string, httpStatus?: number): boolean {
    if (httpStatus && httpStatus >= 500) return true;

    return new Set([
      'ThrottlingException',
      'ServiceUnavailable',
      'InternalFailure',
      'RequestTimeout',
      'TooManyRequestsException',
    ]).has(name);
  }

  private isInsufficientPermissions(
    name: string,
    httpStatus?: number,
  ): boolean {
    if (httpStatus === 403) return true;

    return new Set(['AccessDeniedException', 'AccountSuspendedException']).has(
      name,
    );
  }

  private isConfigurationError(name: string, httpStatus?: number): boolean {
    if (httpStatus === 400) return true;

    return new Set([
      'InvalidParameterValue',
      'InvalidParameterCombination',
      'MissingParameter',
      'MessageRejected',
      'MailFromDomainNotVerifiedException',
      'FromEmailAddressNotVerifiedException',
    ]).has(name);
  }
}
