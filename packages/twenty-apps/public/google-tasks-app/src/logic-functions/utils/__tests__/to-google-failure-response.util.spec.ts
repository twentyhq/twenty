import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  reportConnectionAuthFailure,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { toGoogleFailureResponseOrThrow } from 'src/logic-functions/utils/to-google-failure-response.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  reportConnectionAuthFailure: vi.fn().mockResolvedValue(undefined),
}));

const CONNECTION_ID = 'connection-1';
const AUTHORIZATION_ERROR = 'authorization-failed';

const googleError = (status: number, reason?: string) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: {
      status,
      data: { error: { errors: reason === undefined ? [] : [{ reason }] } },
    },
  });

const handle = (error: unknown) =>
  toGoogleFailureResponseOrThrow({
    error,
    connectionId: CONNECTION_ID,
    authorizationError: AUTHORIZATION_ERROR,
  });

describe('toGoogleFailureResponseOrThrow', () => {
  beforeEach(() => {
    vi.mocked(reportConnectionAuthFailure).mockClear();
  });

  it('marks the connection as failed when Google rejects the credentials', async () => {
    const response = await handle(googleError(401));

    expect(reportConnectionAuthFailure).toHaveBeenCalledWith({
      connectionId: CONNECTION_ID,
      reason: 'Request failed with status code 401',
    });
    expect(response).toEqual({ success: false, error: AUTHORIZATION_ERROR });
  });

  it('asks for a retry without touching the connection when rate limited', async () => {
    await expect(handle(googleError(403, 'rateLimitExceeded'))).rejects.toThrow(
      RetryableLogicFunctionError,
    );

    expect(reportConnectionAuthFailure).not.toHaveBeenCalled();
  });

  it('rethrows other errors without touching the connection', async () => {
    const error = googleError(403, 'accessNotConfigured');

    await expect(handle(error)).rejects.toBe(error);

    expect(reportConnectionAuthFailure).not.toHaveBeenCalled();
  });
});
