export class SalesforceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalesforceConfigError';
  }
}

export class SalesforceAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SalesforceAuthError';
  }
}

export class SalesforceApiError extends Error {
  readonly status: number;
  readonly errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'SalesforceApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
