// Seed: marketplace partners — the partner records the website's
// /partners marketplace page lists, and that seed-pipeline-demo wires
// opportunities to by slug. Idempotent UPSERT: existing partners (by slug) are
// updated to the latest fields (incl. validationStage=VALIDATED); new ones created.
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

const CALENDAR_PLACEHOLDER = 'https://calendly.com/placeholder';

type MarketplacePartner = {
  slug: string;
  name: string;
  introduction: string;
  calendarLink: string;
  deploymentExpertise: string[];
  region: string[];
  languagesSpoken: string[];
  partnerTier: string;
  partnerScope: string[];
  typeOfTeam: string;
};

const MARKETPLACE_PARTNERS: readonly MarketplacePartner[] = [
  {
    slug: 'nine-dots-ventures',
    name: 'Nine Dots Ventures',
    introduction:
      'Boutique CRM implementer specialising in real-estate workflows and WhatsApp inbox automation. Hands-on deployments across France and the Mediterranean.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    region: ['EUROPE', 'MENA'],
    languagesSpoken: ['ENGLISH', 'FRENCH'],
    partnerTier: 'ADVANCED',
    partnerScope: ['DATA_MODEL', 'WORKFLOWS', 'APPS'],
    typeOfTeam: 'AGENCY',
  },
  {
    slug: 'elevate-consulting',
    name: 'Elevate Consulting',
    introduction:
      'Revenue-operations partner for B2B SaaS teams scaling from seed to Series C. Migrates legacy CRMs onto Twenty without losing pipeline history.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['CLOUD'],
    region: ['US', 'LATAM'],
    languagesSpoken: ['ENGLISH', 'SPANISH'],
    partnerTier: 'INTERMEDIATE',
    partnerScope: ['DATA_MIGRATION', 'DATA_MODEL'],
    typeOfTeam: 'AGENCY',
  },
  {
    slug: 'w3villa-technologies',
    name: 'W3Villa Technologies',
    introduction:
      'Engineering-heavy partner running large self-hosted Twenty deployments. Strong on custom objects, RLP, and bespoke logic functions.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    region: ['APAC', 'MENA'],
    languagesSpoken: ['ENGLISH'],
    partnerTier: 'ADVANCED',
    partnerScope: ['HOSTING_ENVIRONMENT', 'APPS', 'WORKFLOWS'],
    typeOfTeam: 'AGENCY',
  },
  {
    slug: 'act-education',
    name: 'Act Education',
    introduction:
      'CRM partner for European education providers. Compliance-first self-hosted deployments with German data-residency requirements.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['SELF_HOST'],
    region: ['EUROPE'],
    languagesSpoken: ['ENGLISH', 'GERMAN'],
    partnerTier: 'NEW',
    partnerScope: ['HOSTING_ENVIRONMENT', 'DATA_MODEL'],
    typeOfTeam: 'SOLO',
  },
  {
    slug: 'netzero-systems',
    name: 'NetZero Systems',
    introduction:
      'Latin America go-to-market partner for climate-tech and renewable-energy companies. Bilingual deal desks running on Twenty Cloud.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['CLOUD'],
    region: ['LATAM', 'US'],
    languagesSpoken: ['ENGLISH', 'SPANISH'],
    partnerTier: 'INTERMEDIATE',
    partnerScope: ['DATA_MODEL'],
    typeOfTeam: 'AGENCY',
  },
  {
    slug: 'meridian-craft',
    name: 'Meridian Craft',
    introduction:
      'APAC implementation studio for fintech and logistics. Multilingual support across English and Chinese, with on-the-ground delivery teams in Singapore and Cape Town.',
    calendarLink: CALENDAR_PLACEHOLDER,
    deploymentExpertise: ['CLOUD', 'SELF_HOST'],
    region: ['APAC', 'AFRICA'],
    languagesSpoken: ['ENGLISH', 'CHINESE'],
    partnerTier: 'ADVANCED',
    partnerScope: ['APPS', 'WORKFLOWS'],
    typeOfTeam: 'AGENCY',
  },
];

describe('seed marketplace partners', () => {
  it('upserts marketplace partners (by slug)', async () => {
    const client = new CoreApiClient();

    const existingResult = await client.query({
      partners: {
        __args: {
          filter: { slug: { in: MARKETPLACE_PARTNERS.map((p) => p.slug) } },
          first: 100,
        },
        edges: { node: { id: true, slug: true } },
      },
    } as any);

    const idBySlug = new Map<string, string>(
      (
        (existingResult?.partners?.edges ?? []) as Array<{
          node: { id: string; slug: string };
        }>
      ).map((e) => [e.node.slug, e.node.id]),
    );

    for (const partner of MARKETPLACE_PARTNERS) {
      const data = {
        name: partner.name,
        slug: partner.slug,
        introduction: partner.introduction,
        calendarLink: { primaryLinkUrl: partner.calendarLink },
        deploymentExpertise: partner.deploymentExpertise,
        region: partner.region,
        languagesSpoken: partner.languagesSpoken,
        partnerTier: partner.partnerTier,
        partnerScope: partner.partnerScope,
        typeOfTeam: partner.typeOfTeam,
        validationStage: 'VALIDATED',
        availability: 'AVAILABLE',
      };

      const existingId = idBySlug.get(partner.slug);
      if (existingId) {
        await client.mutation({
          updatePartner: {
            __args: { id: existingId, data },
            id: true,
            name: true,
          },
        } as any);
        console.log(`[seed] updated ${partner.name} (${existingId})`);
      } else {
        const result = await client.mutation({
          createPartner: { __args: { data }, id: true, name: true },
        } as any);
        const created = (result as any).createPartner;
        console.log(`[seed] created ${created.name} (${created.id})`);
      }
    }
  });
});
