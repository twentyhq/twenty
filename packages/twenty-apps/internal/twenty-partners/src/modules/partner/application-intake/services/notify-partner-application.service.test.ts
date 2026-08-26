import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

import { notifyPartnerApplication } from './notify-partner-application.service';

const PARTNER_ID = '11111111-1111-1111-1111-111111111111';
const WEBHOOK_URL = 'https://discord.test/webhook';

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  queryMock.mockReset();
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, text: async () => '' });
  vi.stubGlobal('fetch', fetchMock);
  process.env.PARTNER_APP_FRONTEND_URL = 'https://partners.twenty.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.PARTNER_APP_FRONTEND_URL;
});

describe('notifyPartnerApplication', () => {
  it('returns {} and posts nothing when the partner row is absent', async () => {
    queryMock.mockResolvedValue({ partners: { edges: [] } });

    const result = await notifyPartnerApplication(PARTNER_ID, WEBHOOK_URL);

    expect(result).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the embed when the partner row is present', async () => {
    queryMock.mockResolvedValue({
      partners: {
        edges: [
          {
            node: {
              id: PARTNER_ID,
              name: 'Analytical Engines Ltd',
              persons: {
                edges: [{ node: { name: { firstName: 'Ada', lastName: 'Lovelace' } } }],
              },
            },
          },
        ],
      },
    });

    const result = await notifyPartnerApplication(PARTNER_ID, WEBHOOK_URL);

    expect(result).toEqual({ notified: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body.embeds[0].url).toBe(`https://partners.twenty.com/object/partner/${PARTNER_ID}`);
  });
});
