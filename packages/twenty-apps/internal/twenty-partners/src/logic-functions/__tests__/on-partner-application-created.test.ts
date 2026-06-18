import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the codegen client BEFORE importing the handler. vi.hoisted lets the
// factory reference the mock fn safely despite hoisting.
const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function (this: { query: typeof queryMock }) {
    this.query = queryMock;
  }),
}));

import {
  buildApplicationEmbed,
  handler,
} from '../on-partner-application-created.logic-function';

const PARTNER_ID = '11111111-1111-1111-1111-111111111111';

const partnerQueryResult = {
  partner: {
    id: PARTNER_ID,
    name: 'Analytical Engines Ltd',
    country: 'FRANCE',
    partnerScope: ['ADVISORY', 'SOLUTIONING'],
    skills: ['Onboarding', 'Migration'],
    languagesSpoken: ['ENGLISH', 'FRENCH'],
    persons: {
      edges: [
        {
          node: {
            name: { firstName: 'Ada', lastName: 'Lovelace' },
          },
        },
      ],
    },
  },
};

// The database event 'after' hydrates the actor composite as a NESTED object
// (after.createdBy.source), confirmed from the live partner.created payload.
const createdEvent = (source: string) =>
  ({ properties: { after: { id: PARTNER_ID, createdBy: { source } } } }) as never;

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue(partnerQueryResult);
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 204, text: async () => '' });
  vi.stubGlobal('fetch', fetchMock);
  process.env.DISCORD_WEBHOOK_URL = 'https://discord.test/webhook';
  process.env.PARTNER_APP_FRONTEND_URL = 'https://partners.twenty.com';
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.DISCORD_WEBHOOK_URL;
  delete process.env.PARTNER_APP_FRONTEND_URL;
});

describe('buildApplicationEmbed', () => {
  it('builds a rich embed with a deep link, includes Languages, omits empty fields, and never sends Email or Hourly rate', () => {
    const embed = buildApplicationEmbed(
      {
        id: PARTNER_ID,
        name: 'Acme',
        country: null, // omitted
        partnerScope: [], // omitted
        skills: ['Migration'],
        languagesSpoken: ['ENGLISH', 'FRENCH'],
        applicant: { firstName: 'Ada', lastName: 'Lovelace' },
      },
      'https://partners.twenty.com',
    );

    expect(embed.title).toBe('New partner application');
    expect(embed.url).toBe(`https://partners.twenty.com/object/partner/${PARTNER_ID}`);

    const fieldNames = (embed.fields as Array<{ name: string }>)
      .map((f) => f.name)
      .filter((n) => n !== '​'); // drop layout spacers
    // country (null) and partnerScope ([]) omitted; Email and Hourly rate never sent.
    expect(fieldNames).toEqual(['Applicant', 'Company', 'Languages', 'Skills']);
    expect(fieldNames).not.toContain('Email');
    expect(fieldNames).not.toContain('Hourly rate');
  });

  it('omits the url when no frontend URL is configured', () => {
    const embed = buildApplicationEmbed({ id: PARTNER_ID, name: 'Acme' }, undefined);
    expect(embed.url).toBeUndefined();
  });
});

describe('on-partner-application-created handler', () => {
  it('posts a Discord embed when an APPLICATION-sourced partner is created', async () => {
    const result = await handler(createdEvent('APPLICATION'));

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://discord.test/webhook');

    const body = JSON.parse((init as { body: string }).body);
    expect(body.embeds[0].title).toBe('New partner application');
    expect(body.embeds[0].url).toBe(`https://partners.twenty.com/object/partner/${PARTNER_ID}`);
    const fieldNames = body.embeds[0].fields
      .map((f: { name: string }) => f.name)
      .filter((n: string) => n !== '​'); // drop layout spacers
    expect(fieldNames).toEqual(['Applicant', 'Company', 'Country', 'Languages', 'Partner scope', 'Skills']);
    expect(fieldNames).not.toContain('Email');
    expect(fieldNames).not.toContain('Hourly rate');

    expect(result).toEqual({ notified: true });
  });

  it('does not post for API-sourced creation (seed/import)', async () => {
    const result = await handler(createdEvent('API'));
    expect(queryMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('does not post for MANUAL-sourced creation', async () => {
    await handler(createdEvent('MANUAL'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not post when DISCORD_WEBHOOK_URL is unset', async () => {
    delete process.env.DISCORD_WEBHOOK_URL;
    const result = await handler(createdEvent('APPLICATION'));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('never throws when the Discord POST fails', async () => {
    fetchMock.mockRejectedValue(new Error('discord down'));
    const result = await handler(createdEvent('APPLICATION'));
    expect(result).toEqual({ notified: false });
  });

  it('reports notified: false on a non-2xx Discord response', async () => {
    // fetch resolves on HTTP errors; the handler must not report these as delivered.
    fetchMock.mockResolvedValue({ ok: false, status: 404, text: async () => 'Not Found' });
    const result = await handler(createdEvent('APPLICATION'));
    expect(result).toEqual({ notified: false });
  });
});
