import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUnipileAccount: vi.fn(),
}));

vi.mock('src/unipile/utils/get-unipile-account.util', () => ({
  getUnipileAccount: mocks.getUnipileAccount,
}));

const { linkedinCallbackHandler } =
  await import('src/logic-functions/linkedin-callback');

const buildPayload = (
  queryStringParameters: Record<string, string | undefined>,
) => ({
  connectionProviderId: 'provider-id',
  connectionProviderName: 'linkedin',
  httpMethod: 'GET' as const,
  queryStringParameters,
  headers: {},
  body: null,
  rawBody: null,
});

describe('linkedinCallbackHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the LinkedIn account Unipile redirected back with', async () => {
    mocks.getUnipileAccount.mockResolvedValue({
      id: 'acc_1',
      provider: 'linkedin',
      name: 'Ada Lovelace',
      user_id: 'ACoME',
      created_at: new Date().toISOString(),
    });

    await expect(
      linkedinCallbackHandler(buildPayload({ account_id: 'acc_1' })),
    ).resolves.toEqual({ externalAccountId: 'acc_1', handle: 'Ada Lovelace' });
  });

  it('connects no account and reports no error when the member cancels the sign-in', async () => {
    await expect(
      linkedinCallbackHandler(
        buildPayload({
          error_title: 'Canceled',
          error_detail: 'Authentication canceled by the user',
        }),
      ),
    ).resolves.toBeNull();

    expect(mocks.getUnipileAccount).not.toHaveBeenCalled();
  });

  it('fails with the reason Unipile gives when the sign-in fails', async () => {
    await expect(
      linkedinCallbackHandler(
        buildPayload({
          error_title: 'Invalid credentials',
          error_detail: 'The password is incorrect',
        }),
      ),
    ).rejects.toThrow('Invalid credentials: The password is incorrect');
  });
});
