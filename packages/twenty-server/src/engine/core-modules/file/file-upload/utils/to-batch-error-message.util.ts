export const toBatchErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
