import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchLineMessageQuota } from 'src/logic-functions/data/fetch-line-message-quota.util';

const stubLineResponses = (responses: Record<string, unknown>) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname;

      return new Response(JSON.stringify(responses[path]), { status: 200 });
    }),
  );

describe('fetchLineMessageQuota', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the monthly limit and the messages sent', async () => {
    stubLineResponses({
      '/v2/bot/message/quota': { type: 'limited', value: 200 },
      '/v2/bot/message/quota/consumption': { totalUsage: 57 },
    });

    expect(await fetchLineMessageQuota('token')).toEqual({
      limit: 200,
      used: 57,
    });
  });

  it('has no limit when the account sets no monthly target', async () => {
    stubLineResponses({
      '/v2/bot/message/quota': { type: 'none' },
      '/v2/bot/message/quota/consumption': { totalUsage: 3 },
    });

    expect(await fetchLineMessageQuota('token')).toEqual({
      limit: null,
      used: 3,
    });
  });
});
