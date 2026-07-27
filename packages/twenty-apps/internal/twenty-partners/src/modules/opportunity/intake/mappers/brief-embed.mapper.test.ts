import { describe, expect, it } from 'vitest';

import { buildBriefEmbed } from './brief-embed.mapper';

const input = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@acme.com',
  companyName: 'Northwind Ltd',
  need: 'Migrate 40 seats off HubSpot',
};

const fieldNamed = (embed: Record<string, unknown>, name: string) =>
  (embed.fields as { name: string; value: string }[]).find((f) => f.name === name);

describe('buildBriefEmbed', () => {
  it('puts the need in the description and links the record', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: null },
      'https://partners.twenty.com',
    );
    expect(embed.title).toBe('New client brief');
    expect(embed.description).toBe('Migrate 40 seats off HubSpot');
    expect(embed.url).toBe('https://partners.twenty.com/object/opportunity/opp-1');
  });

  it('links the referring partner record when one resolved', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: { id: 'p-9', name: 'Acme Consulting' } },
      'https://partners.twenty.com',
    );
    expect(fieldNamed(embed, 'Referred by')?.value).toBe(
      '[Acme Consulting](https://partners.twenty.com/object/partner/p-9)',
    );
  });

  it('falls back to the listing label when no partner referred it', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: null },
      'https://partners.twenty.com',
    );
    expect(fieldNamed(embed, 'Referred by')?.value).toBe('Marketplace listing');
  });

  it('degrades the partner link to plain text when no frontend url is set', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: { id: 'p-9', name: 'Acme Consulting' } },
      undefined,
    );
    expect(fieldNamed(embed, 'Referred by')?.value).toBe('Acme Consulting');
    expect(embed.url).toBeUndefined();
  });

  it('never emits the submitter email', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: null },
      'https://partners.twenty.com',
    );
    expect(JSON.stringify(embed)).not.toContain('jane@acme.com');
  });

  it('truncates a long need and a long requirements block', () => {
    const embed = buildBriefEmbed(
      {
        opportunityId: 'opp-1',
        input: { ...input, need: 'n'.repeat(900), requirements: 'r'.repeat(900) },
        referringPartner: null,
      },
      'https://partners.twenty.com',
    );
    expect((embed.description as string).length).toBe(600);
    expect((embed.description as string).endsWith('…')).toBe(true);
    expect(fieldNamed(embed, 'Requirements')?.value.length).toBe(300);
  });

  it('omits absent optional fields', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input, referringPartner: null },
      'https://partners.twenty.com',
    );
    expect(fieldNamed(embed, 'Hosting')).toBeUndefined();
    expect(fieldNamed(embed, 'Budget')).toBeUndefined();
    expect(fieldNamed(embed, 'Requirements')).toBeUndefined();
  });

  it('pads each inline row to three columns so rows never reflow', () => {
    const embed = buildBriefEmbed(
      { opportunityId: 'opp-1', input: { ...input, seatCount: '40' }, referringPartner: null },
      'https://partners.twenty.com',
    );
    const inlineRun = (embed.fields as { inline?: boolean }[]).filter((f) => f.inline === true);
    expect(inlineRun.length % 3).toBe(0);
  });
});
