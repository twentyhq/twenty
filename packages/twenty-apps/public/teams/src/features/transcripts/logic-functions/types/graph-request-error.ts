export class GraphRequestError extends Error {
  readonly status: number;
  readonly innerErrorCode: string | undefined;

  constructor({
    message,
    status,
    innerErrorCode,
  }: {
    message: string;
    status: number;
    innerErrorCode: string | undefined;
  }) {
    super(message);
    this.name = 'GraphRequestError';
    this.status = status;
    this.innerErrorCode = innerErrorCode;
  }
}
