// Demo data for the partner matching pipeline. Seeds 3 companies, 3 people, and
// 15 opportunities distributed across 9 of the 10 matchStatus values:
//   3 × TO_BE_MATCHED, 2 × MANUAL_MATCH, 1 × AUTO_MATCH,
//   2 × MATCHED, 2 × INTRO_SENT, 2 × ENGAGED,
//   1 × IMPLEMENTING, 1 × COMPLETED, 1 × STALLED.
// CANCELLED is intentionally unpopulated.
//
// Idempotent: skips any company/person/opp that already exists by natural key
// (company.name, person firstName+lastName, opp.name). Safe to re-run.
//
// Run from this app directory, against a running Twenty server with the app
// installed. Credentials come from the shell env or a gitignored .env.local
// (TWENTY_API_URL + TWENTY_API_KEY); see .env.example.
//
//   yarn vitest run --config vitest.seed.config.ts src/scripts/seed-pipeline-demo.ts
//
// Prereq: run seed-marketplace-partners.ts FIRST (partners are looked up by slug
// to wire matched opportunities to real partner records).

import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, it } from 'vitest';

type CompanySeed = { name: string; domain: string };
type PersonSeed = { firstName: string; lastName: string; companyName: string };
type OpportunitySeed = {
  name: string;
  companyName: string;
  personFirstName: string;
  matchStatus:
    | 'TO_BE_MATCHED'
    | 'MANUAL_MATCH'
    | 'AUTO_MATCH'
    | 'MATCHED'
    | 'INTRO_SENT'
    | 'ENGAGED'
    | 'IMPLEMENTING'
    | 'COMPLETED'
    | 'STALLED';
  partnerSlug?: string;
  introSentDaysAgo?: number;
};

const COMPANIES: CompanySeed[] = [
  { name: 'Acme Real Estate', domain: 'https://acmerealestate.example' },
  { name: 'Helix Bio', domain: 'https://helixbio.example' },
  { name: 'Sunrise Logistics', domain: 'https://sunriselogistics.example' },
];

const PERSONS: PersonSeed[] = [
  { firstName: 'Camille', lastName: 'Durand', companyName: 'Acme Real Estate' },
  { firstName: 'Maya', lastName: 'Patel', companyName: 'Helix Bio' },
  { firstName: 'Wei', lastName: 'Chen', companyName: 'Sunrise Logistics' },
];

const OPPORTUNITIES: OpportunitySeed[] = [
  // 3 × TO_BE_MATCHED (default state, no track decided yet)
  { name: 'Acme RE — Q3 renewal',          companyName: 'Acme Real Estate',  personFirstName: 'Camille', matchStatus: 'TO_BE_MATCHED' },
  { name: 'Helix Bio — investor reporting', companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'TO_BE_MATCHED' },
  { name: 'Sunrise — driver app sync',      companyName: 'Sunrise Logistics', personFirstName: 'Wei',     matchStatus: 'TO_BE_MATCHED' },

  // 2 × MANUAL_MATCH (ops will handle manually)
  { name: 'Acme RE — agent training',       companyName: 'Acme Real Estate',  personFirstName: 'Camille', matchStatus: 'MANUAL_MATCH' },
  { name: 'Sunrise — vendor onboarding',    companyName: 'Sunrise Logistics', personFirstName: 'Wei',     matchStatus: 'MANUAL_MATCH' },

  // 1 × AUTO_MATCH (in-flight, no partner yet — usually transient)
  { name: 'Helix Bio — pipeline review',    companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'AUTO_MATCH' },

  // 2 × MATCHED (partner just assigned)
  { name: 'Acme RE — CRM rollout',              companyName: 'Acme Real Estate', personFirstName: 'Camille', matchStatus: 'MATCHED',      partnerSlug: 'elevate-consulting' },
  { name: 'Helix Bio — Sales ops migration',    companyName: 'Helix Bio',        personFirstName: 'Maya',    matchStatus: 'MATCHED',      partnerSlug: 'meridian-craft' },

  // 2 × INTRO_SENT (3 + 5 days ago)
  { name: 'Sunrise — APAC fleet CRM',           companyName: 'Sunrise Logistics', personFirstName: 'Wei',     matchStatus: 'INTRO_SENT',   partnerSlug: 'nine-dots-ventures',   introSentDaysAgo: 3 },
  { name: 'Acme RE — WhatsApp integration',     companyName: 'Acme Real Estate',  personFirstName: 'Camille', matchStatus: 'INTRO_SENT',   partnerSlug: 'w3villa-technologies', introSentDaysAgo: 5 },

  // 2 × ENGAGED
  { name: 'Helix Bio — clinical trials CRM',    companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'ENGAGED',      partnerSlug: 'netzero-systems',      introSentDaysAgo: 10 },
  { name: 'Sunrise — warehouse rollout',         companyName: 'Sunrise Logistics', personFirstName: 'Wei',     matchStatus: 'ENGAGED',      partnerSlug: 'elevate-consulting',   introSentDaysAgo: 14 },

  // 1 × IMPLEMENTING
  { name: 'Helix Bio — Self-host evaluation',   companyName: 'Helix Bio',         personFirstName: 'Maya',    matchStatus: 'IMPLEMENTING', partnerSlug: 'meridian-craft',       introSentDaysAgo: 30 },

  // 1 × COMPLETED
  { name: 'Sunrise — LATAM expansion',           companyName: 'Sunrise Logistics', personFirstName: 'Wei',     matchStatus: 'COMPLETED',    partnerSlug: 'nine-dots-ventures',   introSentDaysAgo: 60 },

  // 1 × STALLED
  { name: 'Acme RE — annual review',             companyName: 'Acme Real Estate',  personFirstName: 'Camille', matchStatus: 'STALLED',      partnerSlug: 'w3villa-technologies', introSentDaysAgo: 45 },
];

describe('seed demo opportunities (companies + persons + opportunities)', () => {
  it('creates companies, persons, and opportunities idempotently', async () => {
    const client = new CoreApiClient();

    // -- Layer 1: Companies (idempotent by name) --
    const companyIds = new Map<string, string>();

    const existingCompanies = await client.query({
      companies: {
        __args: {
          filter: { name: { in: COMPANIES.map((c) => c.name) } },
          first: 100,
        },
        edges: { node: { id: true, name: true } },
      },
    } as any);

    for (const edge of ((existingCompanies?.companies?.edges ?? []) as Array<{
      node: { id: string; name: string };
    }>)) {
      companyIds.set(edge.node.name, edge.node.id);
    }

    for (const company of COMPANIES) {
      if (companyIds.has(company.name)) {
        console.log(`[seed] skip  company ${company.name} (already exists)`);
        continue;
      }
      const result = await client.mutation({
        createCompany: {
          __args: {
            data: {
              name: company.name,
              domainName: { primaryLinkUrl: company.domain },
            },
          },
          id: true,
        },
      } as any);
      const id = (result as any).createCompany.id;
      companyIds.set(company.name, id);
      console.log(`[seed] created company ${company.name} (${id})`);
    }

    // -- Layer 2: Persons (idempotent by firstName+lastName composite) --
    const personIds = new Map<string, string>(); // key = `${firstName} ${lastName}`

    // Filter server-side by firstName only, then narrow to firstName+lastName in JS.
    // Twenty's GraphQL nested composite filters on `name` are unreliable.
    const firstNames = PERSONS.map((p) => p.firstName);
    const existingPersons = await client.query({
      people: {
        __args: {
          filter: { name: { firstName: { in: firstNames } } },
          first: 100,
        },
        edges: {
          node: {
            id: true,
            name: { firstName: true, lastName: true },
          },
        },
      },
    } as any);

    const seedKeys = new Set(
      PERSONS.map((p) => `${p.firstName} ${p.lastName}`),
    );

    for (const edge of ((existingPersons?.people?.edges ?? []) as Array<{
      node: { id: string; name: { firstName: string; lastName: string } };
    }>)) {
      const key = `${edge.node.name.firstName} ${edge.node.name.lastName}`;
      if (seedKeys.has(key)) {
        personIds.set(key, edge.node.id);
      }
    }

    for (const person of PERSONS) {
      const key = `${person.firstName} ${person.lastName}`;
      if (personIds.has(key)) {
        console.log(`[seed] skip  person ${key} (already exists)`);
        continue;
      }
      const companyId = companyIds.get(person.companyName);
      if (!companyId) {
        throw new Error(`Missing company id for ${person.companyName}`);
      }
      const result = await client.mutation({
        createPerson: {
          __args: {
            data: {
              name: {
                firstName: person.firstName,
                lastName: person.lastName,
              },
              companyId,
            },
          },
          id: true,
        },
      } as any);
      const id = (result as any).createPerson.id;
      personIds.set(key, id);
      console.log(`[seed] created person ${key} (${id})`);
    }

    // -- Layer 3a: Lookup all seeded partners by slug --
    const partnerSlugs = OPPORTUNITIES.map((o) => o.partnerSlug).filter(
      (s): s is string => Boolean(s),
    );
    const partnerIds = new Map<string, string>(); // key = slug

    if (partnerSlugs.length > 0) {
      const partnersResult = await client.query({
        partners: {
          __args: {
            filter: { slug: { in: partnerSlugs } },
            first: 100,
          },
          edges: { node: { id: true, slug: true } },
        },
      } as any);
      for (const edge of ((partnersResult?.partners?.edges ?? []) as Array<{
        node: { id: string; slug: string };
      }>)) {
        partnerIds.set(edge.node.slug, edge.node.id);
      }
      for (const slug of partnerSlugs) {
        if (!partnerIds.has(slug)) {
          throw new Error(
            `Partner with slug "${slug}" not found. Run seed-marketplace-partners.ts first.`,
          );
        }
      }
    }

    // -- Layer 3b: Opportunities (idempotent by name) --
    const existingOpps = await client.query({
      opportunities: {
        __args: {
          filter: { name: { in: OPPORTUNITIES.map((o) => o.name) } },
          first: 100,
        },
        edges: { node: { name: true } },
      },
    } as any);

    const existingOppNames = new Set<string>(
      ((existingOpps?.opportunities?.edges ?? []) as Array<{
        node: { name: string };
      }>).map((e) => e.node.name),
    );

    for (const opp of OPPORTUNITIES) {
      if (existingOppNames.has(opp.name)) {
        console.log(`[seed] skip  opp ${opp.name} (already exists)`);
        continue;
      }
      const companyId = companyIds.get(opp.companyName);
      if (!companyId) {
        throw new Error(`Missing company id for ${opp.companyName}`);
      }
      const personKey = `${opp.personFirstName} ${PERSONS.find((p) => p.firstName === opp.personFirstName)?.lastName ?? ''}`;
      const personId = personIds.get(personKey.trim());
      if (!personId) {
        throw new Error(`Missing person id for ${personKey}`);
      }

      const data: Record<string, unknown> = {
        name: opp.name,
        companyId,
        pointOfContactId: personId,
        matchStatus: opp.matchStatus,
      };

      if (opp.partnerSlug) {
        data.partnerId = partnerIds.get(opp.partnerSlug);
      }
      if (opp.introSentDaysAgo !== undefined) {
        const d = new Date();
        d.setDate(d.getDate() - opp.introSentDaysAgo);
        data.introSentAt = d.toISOString();
      }

      const result = await client.mutation({
        createOpportunity: {
          __args: { data },
          id: true,
          name: true,
        },
      } as any);
      const created = (result as any).createOpportunity;
      console.log(`[seed] created opp ${created.name} (status=${opp.matchStatus})`);
    }
  });
});
