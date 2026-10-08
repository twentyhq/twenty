const TRANSIENT_NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNABORTED',
  'EPIPE',
  'ETIMEDOUT',
]);

const TRANSIENT_NETWORK_ERROR_MESSAGES = new Set([
  'Timeout error.',
  'socket hang up',
]);

export const isTransientClickHouseNetworkError = (
  error: unknown,
): error is Error => {
  if (!(error instanceof Error)) {
    return false;
  }

  const code = (error as NodeJS.ErrnoException).code;

  if (
    (code !== undefined && TRANSIENT_NETWORK_ERROR_CODES.has(code)) ||
    TRANSIENT_NETWORK_ERROR_MESSAGES.has(error.message)
  ) {
    return true;
  }

  return isTransientClickHouseNetworkError(
    (error as Error & { cause?: unknown }).cause,
  );
};
