// Seed file: ensures at least one ACTIVE + AVAILABLE partner exists before
// the matching integration tests run. Idempotent — skips if already seeded.
import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeAll, describe, it } from 'vitest';

describe('seed: marketplace partners', () => {
  let client: CoreApiClient;

  beforeAll(() => {
    client = new CoreApiClient();
  });

  it('ensures at least one ACTIVE AVAILABLE partner exists', async () => {
    const existingResult = await client.query({
      partners: {
        __args: {
          filter: { status: { eq: 'ACTIVE' }, availability: { eq: 'AVAILABLE' } },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    } as any);

    const existing = (existingResult as any).partners.edges;
    if (existing.length > 0) {
      console.log('[seed] partner already exists, skipping');
      return;
    }

    const PARTNERS = [
      {
        slug: 'nine-dots-ventures',
        name: 'Nine Dots Ventures',
        introduction: 'Boutique CRM implementer specialising in real-estate workflows.',
        calendlyLink: 'https://calendly.com/placeholder',
        deploymentExpertise: ['CLOUD', 'SELF_HOST'],
        servedGeos: ['EUROPE', 'MENA'],
        languagesSpoken: ['ENGLISH', 'FRENCH'],
      },
      {
        slug: 'elevate-consulting',
        name: 'Elevate Consulting',
        introduction: 'Revenue-operations partner for B2B SaaS teams.',
        calendlyLink: 'https://calendly.com/placeholder',
        deploymentExpertise: ['CLOUD'],
        servedGeos: ['US', 'LATAM'],
        languagesSpoken: ['ENGLISH', 'SPANISH'],
      },
    ];

    for (const p of PARTNERS) {
      const r = await client.mutation({
        createPartner: {
          __args: {
            data: {
              name: p.name,
              slug: p.slug,
              introduction: p.introduction,
              calendlyLink: { primaryLinkUrl: p.calendlyLink },
              deploymentExpertise: p.deploymentExpertise,
              servedGeos: p.servedGeos,
              languagesSpoken: p.languagesSpoken,
              status: 'ACTIVE',
              availability: 'AVAILABLE',
            },
          },
          id: true,
          name: true,
        },
      } as any);
      console.log('[seed] created', (r as any).createPartner.name);
    }
  });
});
