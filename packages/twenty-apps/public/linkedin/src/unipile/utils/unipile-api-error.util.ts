export class UnipileApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly responseBody: string,
  ) {
    super(`Unipile API ${path} failed with ${status}: ${responseBody}`);
    this.name = 'UnipileApiError';
  }
}
