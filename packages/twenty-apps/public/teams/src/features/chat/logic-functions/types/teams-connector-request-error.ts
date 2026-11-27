export class TeamsConnectorRequestError extends Error {
  readonly status: number;

  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'TeamsConnectorRequestError';
    this.status = status;
  }
}
