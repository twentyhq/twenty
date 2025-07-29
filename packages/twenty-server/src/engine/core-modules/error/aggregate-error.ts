export class AggregateError extends Error {
  constructor(
    public readonly errors: Error[],
    message: string = 'Multiple errors occurred',
  ) {
    super(message);
    this.name = 'AggregateError';
  }

  getErrors(): Error[] {
    return this.errors;
  }
} 