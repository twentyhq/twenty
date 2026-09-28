export class GraphRequestError extends Error {
  readonly status: number;

  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'GraphRequestError';
    this.status = status;
  }
}
