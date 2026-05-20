// Seed: marketplace partners — the partner records the website's
// /partners-marketplace page lists, and that seed-pipeline-demo wires
// opportunities to by slug. Idempotent: skips partners that already exist by slug.
//
// Run from this app directory, against a running Twenty server with the app
// installed. Credentials come from the shell env or a gitignored .env.local
// (TWENTY_API_URL + TWENTY_API_KEY); see .env.example.
//
//   yarn twenty dev --once   # ensure the app (Partner object) is installed
//   yarn vitest run --config vitest.seed.config.ts src/scripts/seed-marketplace-partners.ts
//
// Run this BEFORE seed-pipeline-demo.ts.

import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, it } from 'vitest';

const CALENDLY_PLACEHOLDER = 'https://calendly.com/placeholder';

type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendlyLink: string;
  deploymentExpertise: string[];
  servedGeos: string[];
  languagesSpoken: string[];
};

const MARKETPLACE_PARTNERS: readonly MarketplacePartner[] = [
  {
    slug: 'nine-dots-ventures',
    name: 'Nine Dots Ventures',
    introduction:
      'Boutique CRM implementer specialising in real-estate workflows and WhatsApp inbox automation. Hands-on deployments across France and the Mediterranean.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    servedGeos: ['EUROPE', 'MENA'],
    languagesSpoken: ['ENGLISH', 'FRENCH'],
  },
  {
    slug: 'elevate-consulting',
    name: 'Elevate Consulting',
    introduction:
      'Revenue-operations partner for B2B SaaS teams scaling from seed to Series C. Migrates legacy CRMs onto Twenty without losing pipeline history.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['CLOUD'],
    servedGeos: ['US', 'LATAM'],
    languagesSpoken: ['ENGLISH', 'SPANISH'],
  },
  {
    slug: 'w3villa-technologies',
    name: 'W3Villa Technologies',
    introduction:
      'Engineering-heavy partner running large self-hosted Twenty deployments. Strong on custom objects, RLP, and bespoke logic functions.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    servedGeos: ['APAC', 'MENA'],
    languagesSpoken: ['ENGLISH'],
  },
  {
    slug: 'act-education',
    name: 'Act Education',
    introduction:
      'CRM partner for European education providers. Compliance-first self-hosted deployments with German data-residency requirements.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['SELF_HOST'],
    servedGeos: ['EUROPE'],
    languagesSpoken: ['ENGLISH', 'GERMAN'],
  },
  {
    slug: 'netzero-systems',
    name: 'NetZero Systems',
    introduction:
      'Latin America go-to-market partner for climate-tech and renewable-energy companies. Bilingual deal desks running on Twenty Cloud.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['CLOUD'],
    servedGeos: ['LATAM', 'US'],
    languagesSpoken: ['ENGLISH', 'SPANISH'],
  },
  {
    slug: 'meridian-craft',
    name: 'Meridian Craft',
    introduction:
      'APAC implementation studio for fintech and logistics. Multilingual support across English and Chinese, with on-the-ground delivery teams in Singapore and Cape Town.',
    calendlyLink: CALENDLY_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    servedGeos: ['APAC', 'AFRICA'],
    languagesSpoken: ['ENGLISH', 'CHINESE'],
  },
];

describe('seed marketplace partners', () => {
  it('creates partners that do not already exist (slug-idempotent)', async () => {
    const client = new CoreApiClient();

    // Fetch existing slugs to skip duplicates
    const existingResult = await client.query({
      partners: {
        __args: {
          filter: {
            slug: { in: MARKETPLACE_PARTNERS.map((p) => p.slug) },
          },
          first: 100,
        },
        edges: { node: { slug: true } },
      },
    } as any);

    const existingSlugs = new Set<string>(
      (
        (existingResult?.partners?.edges ?? []) as Array<{
          node: { slug: string };
        }>
      ).map((e) => e.node.slug),
    );

    for (const partner of MARKETPLACE_PARTNERS) {
      if (existingSlugs.has(partner.slug)) {
        console.log(`[seed] skip  ${partner.name} (already exists)`);
        continue;
      }

      const result = await client.mutation({
        createPartner: {
          __args: {
            data: {
              name: partner.name,
              slug: partner.slug,
              introduction: partner.introduction,
              calendlyLink: { primaryLinkUrl: partner.calendlyLink },
              deploymentExpertise: partner.deploymentExpertise,
              servedGeos: partner.servedGeos,
              languagesSpoken: partner.languagesSpoken,
              status: 'ACTIVE',
              availability: 'AVAILABLE',
            },
          },
          id: true,
          name: true,
        },
      } as any);

      const created = (result as any).createPartner;
      console.log(`[seed] created ${created.name} (${created.id})`);
    }
  });
});
