import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, postWebhookMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  postWebhookMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));
vi.mock('src/modules/shared/connector/discord/discord.connector', () => ({
  postWebhook: postWebhookMock,
}));

import { notifyListedBrief } from './notify-listed-brief.service';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';

const briefResult = (node: Record<string, unknown> | undefined) => ({
  opportunities: { edges: node === undefined ? [] : [{ node }] },
});

describe('notifyListedBrief', () => {
  beforeEach(() => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', 'https://discord.test/hook');
    vi.stubEnv('PARTNER_APP_FRONTEND_URL', 'https://crm.test/');
    queryMock.mockReset();
    postWebhookMock.mockReset();
    postWebhookMock.mockResolvedValue(true);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('posts one embed built from the record', async () => {
    queryMock.mockResolvedValue(
      briefResult({
        id: OPP,
        name: 'Acme — marketplace brief',
        need: 'Migrate 40 seats to Twenty',
        requirements: 'Hosting: Cloud\nSeats: 40',
        company: { name: 'Acme' },
        pointOfContact: { name: { firstName: 'Jane', lastName: 'Doe' } },
        referredByPartner: { name: 'Meridian Craft' },
      }),
    );
    await notifyListedBrief(OPP);
    expect(postWebhookMock).toHaveBeenCalledTimes(1);
    const [url, payload, label] = postWebhookMock.mock.calls[0];
    expect(url).toBe('https://discord.test/hook');
    expect(label).toBe('notify-listed-brief');
    const embed = payload.embeds[0];
    expect(embed.title).toBe('Brief listed on the marketplace');
    expect(embed.description).toBe('Migrate 40 seats to Twenty');
    expect(embed.url).toBe(`https://crm.test/object/opportunity/${OPP}`);
    expect(embed.fields).toEqual([
      { name: 'Company', value: 'Acme', inline: true },
      { name: 'Contact', value: 'Jane Doe', inline: true },
      { name: 'Referred by', value: 'Meridian Craft', inline: true },
      { name: 'Requirements', value: 'Hosting: Cloud\nSeats: 40' },
    ]);
  });

  it('does nothing without a webhook url', async () => {
    vi.stubEnv('DISCORD_WEBHOOK_URL', '');
    await expect(notifyListedBrief(OPP)).resolves.toBe(false);
    expect(queryMock).not.toHaveBeenCalled();
    expect(postWebhookMock).not.toHaveBeenCalled();
  });

  it('reports false when the opportunity is missing (empty edges)', async () => {
    queryMock.mockResolvedValue(briefResult(undefined));
    await expect(notifyListedBrief(OPP)).resolves.toBe(false);
    expect(postWebhookMock).not.toHaveBeenCalled();
  });

  it('swallows a read failure and reports false', async () => {
    queryMock.mockRejectedValue(new Error('boom'));
    await expect(notifyListedBrief(OPP)).resolves.toBe(false);
  });

  it('swallows a webhook failure and reports false', async () => {
    queryMock.mockResolvedValue(briefResult({ id: OPP, name: 'n', need: 'x' }));
    postWebhookMock.mockRejectedValue(new Error('discord down'));
    await expect(notifyListedBrief(OPP)).resolves.toBe(false);
  });

  it('omits empty fields and falls back to the name as description', async () => {
    queryMock.mockResolvedValue(
      briefResult({ id: OPP, name: 'Acme — marketplace brief' }),
    );
    await notifyListedBrief(OPP);
    const embed = postWebhookMock.mock.calls[0][1].embeds[0];
    expect(embed.description).toBe('Acme — marketplace brief');
    expect(embed.fields).toEqual([]);
  });
});
