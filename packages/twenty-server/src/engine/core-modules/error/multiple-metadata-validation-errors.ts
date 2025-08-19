export class MultipleMetadataValidationErrors extends Error {
  constructor(
    public readonly errors: Error[],
    message: string,
  ) {
    const allMessages = `${message}\n${errors.map((error) => error.message).join('\n')}`;
    super(allMessages);
    this.name = 'MultipleMetadataValidationErrors';
  }
}
