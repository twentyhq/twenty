export class EmailForwardingDriverException extends Error {
  code: EmailForwardingDriverExceptionCode;
  cause?: Error;

  constructor(
    message: string,
    code: EmailForwardingDriverExceptionCode,
    options?: { cause?: Error },
  ) {
    super(message);
    this.name = 'EmailForwardingDriverException';
    this.code = code;
    this.cause = options?.cause;

    if (options?.cause?.stack) {
      this.stack = `${this.stack}\nCaused by: ${options.cause.stack}`;
    }
  }
}

export enum EmailForwardingDriverExceptionCode {
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  SOURCE_ADDRESS_UNAVAILABLE = 'SOURCE_ADDRESS_UNAVAILABLE',
  SOURCE_ADDRESS_DOMAIN_NOT_OWNED = 'SOURCE_ADDRESS_DOMAIN_NOT_OWNED',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  UNKNOWN = 'UNKNOWN',
}
