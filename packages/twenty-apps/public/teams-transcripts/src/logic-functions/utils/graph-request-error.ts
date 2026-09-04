export class GraphRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errorCode: string | undefined,
    public readonly innerErrorCode: string | undefined,
  ) {
    super(message);
    this.name = 'GraphRequestError';
  }
}
