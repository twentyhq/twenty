export class JsonLogicConversionError extends Error {
  constructor(
    message: string,
    public readonly nodeText?: string,
    public readonly nodeKind?: string,
  ) {
    super(message);
    this.name = 'JsonLogicConversionError';
  }
}
