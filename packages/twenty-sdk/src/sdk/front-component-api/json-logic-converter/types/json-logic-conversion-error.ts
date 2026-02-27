export class JsonLogicConversionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JsonLogicConversionError';
  }
}
