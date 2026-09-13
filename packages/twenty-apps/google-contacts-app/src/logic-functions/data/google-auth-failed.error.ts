export class GoogleAuthFailedError extends Error {
  constructor(readonly status: number) {
    super(`Google People API returned ${status}`);
    this.name = 'GoogleAuthFailedError';
  }
}
