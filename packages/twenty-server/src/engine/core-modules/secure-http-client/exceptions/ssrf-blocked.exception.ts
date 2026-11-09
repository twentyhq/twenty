// A plain Error with a `code`, so axios keeps it as `cause` and callers can tell a guard block from a network error.
export class SsrfBlockedException extends Error {
  readonly code = 'ERR_SSRF_BLOCKED';

  constructor(
    message: string,
    public readonly address: string,
  ) {
    super(message);
    this.name = 'SsrfBlockedException';
  }
}
