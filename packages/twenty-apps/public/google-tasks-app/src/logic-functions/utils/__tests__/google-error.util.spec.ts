import { describe, expect, it } from 'vitest';
import {
  isGoogleAuthorizationFailure,
  isGoogleRateLimitError,
  isTransientGoogleError,
} from 'src/logic-functions/utils/google-error.util';

const googleError = (status: number, reason?: string) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: {
      status,
      data: { error: { errors: reason === undefined ? [] : [{ reason }] } },
    },
  });

const networkError = (code: string) =>
  Object.assign(new Error(code), { isAxiosError: true, code });

describe('isGoogleRateLimitError', () => {
  it.each([
    ['a 429', googleError(429)],
    ['a 403 over the rate limit', googleError(403, 'rateLimitExceeded')],
    [
      'a 403 over the user rate limit',
      googleError(403, 'userRateLimitExceeded'),
    ],
  ])('recognizes %s', (_, error) => {
    expect(isGoogleRateLimitError(error)).toBe(true);
  });

  it.each([
    ['a 403 permission error', googleError(403, 'insufficientPermissions')],
    ['a server error', googleError(503)],
    ['a timeout', networkError('ECONNABORTED')],
  ])('ignores %s', (_, error) => {
    expect(isGoogleRateLimitError(error)).toBe(false);
  });
});

describe('isTransientGoogleError', () => {
  it.each([
    ['a timeout', networkError('ECONNABORTED')],
    ['a reset connection', networkError('ECONNRESET')],
    ['a refused connection', networkError('ECONNREFUSED')],
    ['a server error', googleError(503)],
    ['a 403 over the rate limit', googleError(403, 'rateLimitExceeded')],
  ])('retries %s', (_, error) => {
    expect(isTransientGoogleError(error)).toBe(true);
  });

  it.each([
    ['rejected credentials', googleError(401)],
    ['a missing task', googleError(404)],
    ['a non-Google error', new Error('boom')],
  ])('does not retry %s', (_, error) => {
    expect(isTransientGoogleError(error)).toBe(false);
  });
});

describe('isGoogleAuthorizationFailure', () => {
  it.each([
    ['rejected credentials', googleError(401)],
    ['a missing Tasks scope', googleError(403, 'insufficientPermissions')],
  ])('flags %s', (_, error) => {
    expect(isGoogleAuthorizationFailure(error)).toBe(true);
  });

  it.each([
    ['a 403 over the rate limit', googleError(403, 'rateLimitExceeded')],
    ['a disabled API', googleError(403, 'accessNotConfigured')],
    ['a 403 without a reason', googleError(403)],
  ])('does not flag %s', (_, error) => {
    expect(isGoogleAuthorizationFailure(error)).toBe(false);
  });
});
