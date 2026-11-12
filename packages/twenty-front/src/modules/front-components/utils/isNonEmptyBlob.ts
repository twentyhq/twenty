export const isNonEmptyBlob = (value: unknown): value is Blob =>
  value instanceof Blob && value.size !== 0;
