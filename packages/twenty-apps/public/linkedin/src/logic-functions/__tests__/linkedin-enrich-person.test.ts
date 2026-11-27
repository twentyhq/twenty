import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ enrichLinkedinPerson: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({
  RetryableLogicFunctionError: class RetryableLogicFunctionError extends Error {
    name = 'RetryableLogicFunctionError';
  },
}));

vi.mock('src/logic-functions/utils/enrich-linkedin-person.util', () => ({
  enrichLinkedinPerson: mocks.enrichLinkedinPerson,
}));

const { linkedinEnrichPersonHandler } =
  await import('src/logic-functions/linkedin-enrich-person');

const { UnipileRateLimitError } =
  await import('src/unipile/utils/request-unipile.util');

const PAYLOAD = {
  unipileAccountId: 'unipile-account-id',
  personId: 'priya-id',
  providerUserId: 'priya-provider-id',
};

describe('linkedinEnrichPersonHandler', () => {
  beforeEach(() => {
    mocks.enrichLinkedinPerson.mockReset().mockResolvedValue(undefined);
  });

  it('enriches the person before the function times out', async () => {
    await linkedinEnrichPersonHandler(PAYLOAD);

    const [{ deadlineAtMs }] = mocks.enrichLinkedinPerson.mock.calls[0];

    expect(mocks.enrichLinkedinPerson).toHaveBeenCalledWith(
      expect.objectContaining(PAYLOAD),
    );
    expect(deadlineAtMs).toBeLessThan(Date.now() + 30_000);
  });

  it('drops the job once the daily lookups are used', async () => {
    mocks.enrichLinkedinPerson.mockRejectedValue(
      new UnipileRateLimitError('lookups used', 3600),
    );

    await expect(linkedinEnrichPersonHandler(PAYLOAD)).resolves.toBeUndefined();
  });

  it('retries the job after a network error', async () => {
    mocks.enrichLinkedinPerson.mockRejectedValue(
      Object.assign(new Error('fetch failed'), { name: 'TypeError' }),
    );

    await expect(linkedinEnrichPersonHandler(PAYLOAD)).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
    });
  });
});
