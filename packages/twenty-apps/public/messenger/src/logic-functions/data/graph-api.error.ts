export class GraphApiError extends Error {
  constructor(
    message: string,
    readonly code: number,
  ) {
    super(message);
  }
}
