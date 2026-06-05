export class PdlConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdlConfigError';
  }
}
