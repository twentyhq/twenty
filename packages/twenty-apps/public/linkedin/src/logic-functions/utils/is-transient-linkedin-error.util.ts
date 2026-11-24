import { isNumber, isObject } from '@sniptt/guards';

const TRANSIENT_HTTP_STATUSES = [429, 500, 502, 503, 504];

export const isTransientLinkedinError = (error: unknown): boolean => {
  const status = isObject(error)
    ? (error as { status?: unknown }).status
    : undefined;

  return (
    (error instanceof Error &&
      (error.name === 'TypeError' || error.name === 'AbortError')) ||
    (isNumber(status) && TRANSIENT_HTTP_STATUSES.includes(status))
  );
};
