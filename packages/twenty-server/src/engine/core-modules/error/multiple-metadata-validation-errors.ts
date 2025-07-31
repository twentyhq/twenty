export class MultipleMetadataValidationErrors extends Error {
  constructor(
    public readonly errors: Error[],
    message = 'Multiple errors occurred',
  ) {
    super(message);
    this.name = 'AggregateError';
  }
}
