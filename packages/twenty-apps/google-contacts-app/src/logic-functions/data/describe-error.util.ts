export const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
