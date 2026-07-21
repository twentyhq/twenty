import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeAll, describe, expect, it } from 'vitest';

import { handler as getPartnerBySlug } from '../get-partner-by-slug.logic-function';
import { handler as listAvailablePartners } from '../list-available-partners.logic-function';

const client = new CoreApiClient();
const KNOWN_SLUG = 'nine-dots-ventures';

async function ensureMarketplacePartnerExists(): Promise<void> {
  const existing = await client.query({
    partners: {
      __args: { filter: { slug: { eq: KNOWN_SLUG } }, first: 1 },
      edges: {
        node: {
          id: true,
          validationStage: true,
          availability: true,
        },
      },
    },
  });

  const node = existing.partners?.edges?.[0]?.node;

  if (node) {
    if (
      node.validationStage === 'VALIDATED' &&
      node.availability === 'AVAILABLE'
    ) {
      return;
    }

    await client.mutation({
      updatePartner: {
        __args: {
          id: node.id,
          data: {
            validationStage: 'VALIDATED',
            availability: 'AVAILABLE',
          },
        },
        id: true,
      },
    });

    return;
  }

  await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: 'Nine Dots Ventures',
          slug: KNOWN_SLUG,
          introduction:
            '## About Nine Dots\n\nMarketplace integration test partner.',
          calendarLink: { primaryLinkUrl: 'https://calendly.com/placeholder' },
          validationStage: 'VALIDATED',
          availability: 'AVAILABLE',
        },
      },
      id: true,
    },
  });
}

beforeAll(async () => {
  await client.query({
    partners: { __args: { first: 1 }, edges: { node: { id: true } } },
  });
  await ensureMarketplacePartnerExists();
});

describe('list-available-partners handler', () => {
  it('returns validated available partners with plain introduction excerpts', async () => {
    const result = await listAvailablePartners();

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.count).toBeGreaterThan(0);
    expect(Array.isArray(result.partners)).toBe(true);

    const partner = result.partners.find((entry) => entry.slug === KNOWN_SLUG);
    expect(partner).toBeDefined();
    if (!partner) {
      return;
    }

    expect(partner.name.length).toBeGreaterThan(0);
    expect(partner.introduction.length).toBeGreaterThan(0);
    expect(partner.introduction).not.toMatch(/^##\s/m);
    expect('projectBudgetTypical' in partner).toBe(false);
    expect('profileLinks' in partner).toBe(false);
    expect('services' in partner).toBe(false);
    expect('portfolio' in partner).toBe(false);
  });
});

describe('get-partner-by-slug handler', () => {
  it('returns NOT_FOUND for an unknown slug', async () => {
    const result = await getPartnerBySlug({
      queryStringParameters: { slug: `missing-partner-${Date.now()}` },
    });

    expect(result).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('returns profile payload with markdown introduction and nested collections', async () => {
    const result = await getPartnerBySlug({
      queryStringParameters: { slug: KNOWN_SLUG },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const { partner } = result;
    expect(partner.slug).toBe(KNOWN_SLUG);
    expect(partner.introduction.length).toBeGreaterThan(0);
    expect('projectBudgetTypical' in partner).toBe(true);
    expect(Array.isArray(partner.profileLinks)).toBe(true);
    expect(Array.isArray(partner.services)).toBe(true);
    expect(Array.isArray(partner.portfolio)).toBe(true);

    for (const service of partner.services) {
      expect(typeof service.title).toBe('string');
      expect(typeof service.description).toBe('string');
    }

    for (const item of partner.portfolio) {
      expect(typeof item.client).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.body).toBe('string');
    }
  });
});
