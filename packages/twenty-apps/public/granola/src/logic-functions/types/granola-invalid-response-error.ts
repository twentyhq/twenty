export class GranolaInvalidResponseError extends Error {
  constructor() {
    super('Granola returned an unexpected response.');
    this.name = 'GranolaInvalidResponseError';
  }
}
