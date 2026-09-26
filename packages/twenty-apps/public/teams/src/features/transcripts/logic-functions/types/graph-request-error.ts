export class GraphRequestError extends Error {
  readonly status: number;
  readonly errorCode: string | undefined;
  readonly innerErrorCode: string | undefined;

  constructor({
    message,
    status,
    errorCode,
    innerErrorCode,
  }: {
    message: string;
    status: number;
    errorCode: string | undefined;
    innerErrorCode: string | undefined;
  }) {
    super(message);
    this.name = 'GraphRequestError';
    this.status = status;
    this.errorCode = errorCode;
    this.innerErrorCode = innerErrorCode;
  }
}
