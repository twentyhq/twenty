import { describe, expect, it, vi } from 'vitest';

class AppConnectionAuthFailedError extends Error {}

vi.mock('twenty-sdk/logic-function', () => ({ AppConnectionAuthFailedError }));

const { getWhatsappHistoryImportError } =
  await import('src/logic-functions/utils/get-whatsapp-history-import-error.util');

describe('getWhatsappHistoryImportError', () => {
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
        title: 'Chats are not available for this account.',
      },
      code: 'UNKNOWN',
      message: 'Chats are not available for this account.',
    },
    {
      error: { status: 422, title: 'Invalid cursor' },
      code: 'UNKNOWN',
      message: 'Invalid cursor',
    },
  ])('classifies $message as $code', ({ error, code, message }) => {
    expect(getWhatsappHistoryImportError(error)).toEqual({ code, message });
  });
});
