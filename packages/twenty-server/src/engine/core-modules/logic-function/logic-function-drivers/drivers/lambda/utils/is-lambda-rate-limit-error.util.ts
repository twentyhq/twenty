const LAMBDA_RATE_LIMIT_ERROR_NAMES = new Set([
  'TooManyRequestsException',
  'ThrottlingException',
]);

export const isLambdaRateLimitError = (error: unknown): boolean =>
  error instanceof Error && LAMBDA_RATE_LIMIT_ERROR_NAMES.has(error.name);
