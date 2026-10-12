export const hasErrorCode = (error: unknown, code: string) =>
  error instanceof Error && 'code' in error && error.code === code;
