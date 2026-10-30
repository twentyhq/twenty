import { describe, expect, it, vi } from 'vitest';

class AppConnectionAuthFailedError extends Error {}

vi.mock('twenty-sdk/logic-function', () => ({ AppConnectionAuthFailedError }));

const { getLinkedinHistoryImportError } =
  await import('src/logic-functions/utils/get-linkedin-history-import-error.util');

describe('getLinkedinHistoryImportError', () => {
  it.each([
    {
      error: new AppConnectionAuthFailedError('Connection auth failed'),
      code: 'AUTH_FAILED',
      message: 'Connection auth failed',
    },
    {
      error: {
        status: 401,
        title: 'Unauthorized',
        detail: 'Account disconnected',
      },
      code: 'AUTH_FAILED',
      message: 'Account disconnected',
    },
    {
      error: Object.assign(new TypeError('fetch failed'), {}),
      code: 'UNREACHABLE',
      message: 'fetch failed',
    },
    {
      error: { status: 503, title: 'Service unavailable' },
      code: 'UNREACHABLE',
      message: 'Service unavailable',
    },
    {
      error: {
        status: 501,
        title: 'Use List inbox Chats endpoint for this provider.',
      },
      code: 'UNKNOWN',
      message: 'Use List inbox Chats endpoint for this provider.',
    },
    {
      error: { status: 422, title: 'Invalid cursor' },
      code: 'UNKNOWN',
      message: 'Invalid cursor',
    },
  ])('classifies $message as $code', ({ error, code, message }) => {
    expect(getLinkedinHistoryImportError(error)).toEqual({ code, message });
  });
});
