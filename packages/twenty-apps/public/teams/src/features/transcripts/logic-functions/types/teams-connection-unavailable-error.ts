export class TeamsConnectionUnavailableError extends Error {
  readonly code: 'not-connected' | 'reconnect-required';

  constructor({
    message,
    code,
  }: {
    message: string;
    code: 'not-connected' | 'reconnect-required';
  }) {
    super(message);
    this.name = 'TeamsConnectionUnavailableError';
    this.code = code;
  }
}
