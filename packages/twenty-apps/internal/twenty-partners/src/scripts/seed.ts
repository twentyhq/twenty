// Single demo seed for the twenty-partners app. Idempotent UPSERT by natural key.
// Covers: partners across ALL validationStage values, companies + people,
// opportunities across ALL stage values, and partner quotes across ALL
// 5 statuses (each linked to a partner + opportunity).
//
// Run from this app directory, against a running Twenty server with the app
// installed (deploy first; do NOT run `yarn test` after — its teardown wipes the app).
// Credentials from shell env or a gitignored .env.local (TWENTY_PARTNERS_API_URL/KEY).
//
//   yarn twenty dev --once
//   tsx src/scripts/seed.ts

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient } from 'twenty-client-sdk/core';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

const CAL = 'https://calendly.com/placeholder';
const usd = (dollars: number) => ({
  amountMicros: dollars * 1_000_000,
  currencyCode: 'USD',
});
// Deterministic placeholder avatars; pravatar returns a stable image per `u` seed.
const avatar = (slug: string) => `https://i.pravatar.cc/300?u=${slug}`;
const linkedin = (slug: string) =>
  `https://www.linkedin.com/company/${slug}`;

type Partner = {
  slug: string;
  name: string;
  validationStage: string;
  availability: string;
  introduction: string;
  calendarLink: string;
  deploymentExpertise: string[];
  region: string[];
  languagesSpoken: string[];
  partnerTier: string;
  partnerScope: string[];
  typeOfTeam: string;
  country: string;
  city: string;
  hourlyRateUsd: number | null;
  projectBudgetMinUsd: number | null;
  skills: string[];
};

const PARTNERS: Partner[] = [
  { slug: 'nine-dots-ventures', name: 'Nine Dots Ventures', validationStage: 'VALIDATED', availability: 'AVAILABLE', introduction: 'Boutique CRM implementer for real-estate workflows and WhatsApp automation. Nine Dots runs end-to-end Twenty rollouts for property managers and brokerages across Europe and MENA, with deep multi-language data models and AI-assisted lead intake.', calendarLink: CAL, deploymentExpertise: ['CLOUD', 'SELF_HOST'], region: ['EUROPE', 'MENA'], languagesSpoken: ['ENGLISH', 'FRENCH', 'ARABIC'], partnerTier: 'ADVANCED', partnerScope: ['DATA_MODEL', 'WORKFLOWS', 'APPS'], typeOfTeam: 'AGENCY', country: 'FRANCE', city: 'Paris', hourlyRateUsd: 250, projectBudgetMinUsd: 15000, skills: ['Real estate', 'WhatsApp', 'Multi-language', 'Workflows', 'Integrations', 'AI'] },
  { slug: 'elevate-consulting', name: 'Elevate Consulting', validationStage: 'VALIDATED', availability: 'AVAILABLE', introduction: 'Revenue-operations partner for B2B SaaS teams scaling seed to Series C. Elevate moves teams off legacy CRMs onto Twenty with a four-week migration playbook, pipeline rebuilds, and analytics handoff.', calendarLink: CAL, deploymentExpertise: ['CLOUD'], region: ['US', 'LATAM'], languagesSpoken: ['ENGLISH', 'SPANISH'], partnerTier: 'INTERMEDIATE', partnerScope: ['DATA_MIGRATION', 'DATA_MODEL'], typeOfTeam: 'AGENCY', country: 'UNITED_STATES', city: 'Austin', hourlyRateUsd: 200, projectBudgetMinUsd: 20000, skills: ['RevOps', 'B2B SaaS', 'Data migration', 'Pipelines', 'Salesforce migration', 'HubSpot migration'] },
  { slug: 'w3villa-technologies', name: 'W3Villa Technologies', validationStage: 'VALIDATED', availability: 'AVAILABLE', introduction: 'Engineering-heavy partner running large self-hosted Twenty deployments. Specializes in hardened Kubernetes hosting, custom integrations, and 24/7 support contracts for regulated industries across APAC and the Gulf.', calendarLink: CAL, deploymentExpertise: ['CLOUD', 'SELF_HOST'], region: ['APAC', 'MENA'], languagesSpoken: ['ENGLISH', 'HINDI'], partnerTier: 'ADVANCED', partnerScope: ['HOSTING_ENVIRONMENT', 'APPS', 'WORKFLOWS'], typeOfTeam: 'AGENCY', country: 'INDIA', city: 'Bangalore', hourlyRateUsd: 120, projectBudgetMinUsd: 10000, skills: ['Self-hosting', 'Kubernetes', 'DevOps', 'Integrations', 'Workflows', 'Enterprise support'] },
  { slug: 'act-education', name: 'Act Education', validationStage: 'VALIDATED', availability: 'UNAVAILABLE', introduction: 'CRM partner for European education providers; compliance-first self-hosting on EU infrastructure with full GDPR data residency and student-record workflows.', calendarLink: CAL, deploymentExpertise: ['SELF_HOST'], region: ['EUROPE'], languagesSpoken: ['ENGLISH', 'GERMAN'], partnerTier: 'NEW', partnerScope: ['HOSTING_ENVIRONMENT', 'DATA_MODEL'], typeOfTeam: 'SOLO', country: 'GERMANY', city: 'Berlin', hourlyRateUsd: 180, projectBudgetMinUsd: 8000, skills: ['Education', 'Compliance', 'Self-hosting', 'GDPR', 'Data privacy'] },
  { slug: 'netzero-systems', name: 'NetZero Systems', validationStage: 'VALIDATED', availability: 'AVAILABLE', introduction: 'LATAM go-to-market partner for climate-tech and renewable-energy companies. Builds bilingual sales pipelines, ESG reporting, and grant-management workflows on top of Twenty.', calendarLink: CAL, deploymentExpertise: ['CLOUD'], region: ['LATAM', 'US'], languagesSpoken: ['ENGLISH', 'SPANISH', 'PORTUGUESE'], partnerTier: 'INTERMEDIATE', partnerScope: ['DATA_MODEL'], typeOfTeam: 'AGENCY', country: 'BRAZIL', city: 'São Paulo', hourlyRateUsd: 150, projectBudgetMinUsd: 12000, skills: ['Climate tech', 'Renewable energy', 'ESG reporting', 'Bilingual pipelines', 'LATAM go-to-market'] },
  { slug: 'meridian-craft', name: 'Meridian Craft', validationStage: 'VALIDATED', availability: 'AVAILABLE', introduction: 'APAC implementation studio for fintech and logistics. Senior team of ex-bank engineers building high-throughput Twenty deployments across Singapore, Hong Kong, and Kuala Lumpur.', calendarLink: CAL, deploymentExpertise: ['CLOUD', 'SELF_HOST'], region: ['APAC', 'AFRICA'], languagesSpoken: ['ENGLISH', 'CHINESE', 'MALAY'], partnerTier: 'ADVANCED', partnerScope: ['APPS', 'WORKFLOWS'], typeOfTeam: 'AGENCY', country: 'SINGAPORE', city: 'Singapore', hourlyRateUsd: 300, projectBudgetMinUsd: 25000, skills: ['Fintech', 'Logistics', 'APAC', 'High throughput', 'Custom apps', 'Performance tuning'] },
  { slug: 'applicant-studio', name: 'Applicant Studio', validationStage: 'APPLICATION', availability: 'UNAVAILABLE', introduction: 'New applicant; awaiting first review.', calendarLink: CAL, deploymentExpertise: ['CLOUD'], region: ['EUROPE'], languagesSpoken: ['ENGLISH', 'FRENCH'], partnerTier: 'NEW', partnerScope: ['DATA_MODEL'], typeOfTeam: 'SOLO', country: 'FRANCE', city: 'Lyon', hourlyRateUsd: null, projectBudgetMinUsd: null, skills: ['Boutique', 'Design'] },
  { slug: 'rising-crm', name: 'Rising CRM', validationStage: 'POTENTIAL', availability: 'AVAILABLE', introduction: 'Promising applicant in evaluation.', calendarLink: CAL, deploymentExpertise: ['CLOUD', 'SELF_HOST'], region: ['US'], languagesSpoken: ['ENGLISH'], partnerTier: 'NEW', partnerScope: ['WORKFLOWS', 'APPS'], typeOfTeam: 'AGENCY', country: 'UNITED_STATES', city: 'New York', hourlyRateUsd: null, projectBudgetMinUsd: null, skills: ['SMB', 'Quick setup'] },
  { slug: 'legacy-partners', name: 'Legacy Partners', validationStage: 'FORMER', availability: 'UNAVAILABLE', introduction: 'Former partner; no longer active in the program.', calendarLink: CAL, deploymentExpertise: ['SELF_HOST'], region: ['EUROPE'], languagesSpoken: ['ENGLISH', 'GERMAN'], partnerTier: 'INTERMEDIATE', partnerScope: ['HOSTING_ENVIRONMENT'], typeOfTeam: 'AGENCY', country: 'UNITED_KINGDOM', city: 'London', hourlyRateUsd: null, projectBudgetMinUsd: null, skills: ['Enterprise', 'Self-hosting'] },
  { slug: 'declined-co', name: 'Declined Co', validationStage: 'REJECTED', availability: 'UNAVAILABLE', introduction: 'Application rejected after review.', calendarLink: CAL, deploymentExpertise: ['CLOUD'], region: ['MENA'], languagesSpoken: ['ENGLISH', 'ARABIC'], partnerTier: 'NEW', partnerScope: ['APPS'], typeOfTeam: 'SOLO', country: 'UNITED_ARAB_EMIRATES', city: 'Dubai', hourlyRateUsd: null, projectBudgetMinUsd: null, skills: ['MENA', 'Arabic'] },
];

const COMPANIES = [
  { name: 'Acme Real Estate', domain: 'https://acmerealestate.example' },
  { name: 'Helix Bio', domain: 'https://helixbio.example' },
  { name: 'Sunrise Logistics', domain: 'https://sunriselogistics.example' },
];

const PERSONS = [
  { firstName: 'Camille', lastName: 'Durand', companyName: 'Acme Real Estate', email: 'camille@acmerealestate.example', city: 'Paris' },
  { firstName: 'Maya', lastName: 'Patel', companyName: 'Helix Bio', email: 'maya@helixbio.example', city: 'Boston' },
  { firstName: 'Wei', lastName: 'Chen', companyName: 'Sunrise Logistics', email: 'wei@sunriselogistics.example', city: 'Singapore' },
];

type Opp = {
  name: string;
  companyName: string;
  stage: string;
  partnerSlug?: string;
  numberOfSeats?: number;
  hostingType?: string;
  subscriptionType?: string;
  subscriptionFrequency?: string;
};

// One+ opportunity for every stage value (all 5 covered).
const OPPORTUNITIES: Opp[] = [
  { name: 'Acme RE — Q3 renewal', companyName: 'Acme Real Estate', stage: 'NEW', numberOfSeats: 20, hostingType: 'CLOUD', subscriptionType: 'PRO', subscriptionFrequency: 'ANNUAL' },
  { name: 'Helix Bio — investor reporting', companyName: 'Helix Bio', stage: 'NEW', numberOfSeats: 12, hostingType: 'CLOUD', subscriptionType: 'ORG', subscriptionFrequency: 'MONTHLY' },
  { name: 'Helix Bio — pipeline review', companyName: 'Helix Bio', stage: 'SCREENING', numberOfSeats: 8 },
  { name: 'Acme RE — CRM rollout', companyName: 'Acme Real Estate', stage: 'MEETING', partnerSlug: 'elevate-consulting', numberOfSeats: 30, hostingType: 'CLOUD', subscriptionType: 'ENT', subscriptionFrequency: 'ANNUAL' },
  { name: 'Sunrise — APAC fleet CRM', companyName: 'Sunrise Logistics', stage: 'MEETING', partnerSlug: 'nine-dots-ventures', numberOfSeats: 50, hostingType: 'SELF_HOSTING', subscriptionType: 'ENT', subscriptionFrequency: 'ANNUAL' },
  { name: 'Helix Bio — clinical trials CRM', companyName: 'Helix Bio', stage: 'PROPOSAL', partnerSlug: 'netzero-systems', numberOfSeats: 25, hostingType: 'CLOUD', subscriptionType: 'ORG', subscriptionFrequency: 'MONTHLY' },
  { name: 'Helix Bio — self-host evaluation', companyName: 'Helix Bio', stage: 'PROPOSAL', partnerSlug: 'meridian-craft', numberOfSeats: 40, hostingType: 'SELF_HOSTING', subscriptionType: 'ENT', subscriptionFrequency: 'ANNUAL' },
  { name: 'Sunrise — LATAM expansion', companyName: 'Sunrise Logistics', stage: 'CUSTOMER', partnerSlug: 'nine-dots-ventures', numberOfSeats: 60, hostingType: 'CLOUD', subscriptionType: 'ENT', subscriptionFrequency: 'ANNUAL' },
  { name: 'Acme RE — annual review', companyName: 'Acme Real Estate', stage: 'CUSTOMER', partnerSlug: 'w3villa-technologies', numberOfSeats: 15 },
  { name: 'Sunrise — vendor onboarding', companyName: 'Sunrise Logistics', stage: 'SCREENING', numberOfSeats: 10, hostingType: 'CLOUD', subscriptionType: 'PRO', subscriptionFrequency: 'MONTHLY' },
];

type Quote = { name: string; status: string; partnerSlug: string; contentType: string[] };
const QUOTES: Quote[] = [
  { name: 'Sunrise APAC fleet — Nine Dots quote', status: 'WIP', partnerSlug: 'nine-dots-ventures', contentType: ['PARTNER_QUOTE'] },
  { name: 'Helix clinical — NetZero quote', status: 'INTERVIEW_SCHEDULED', partnerSlug: 'netzero-systems', contentType: ['PARTNER_QUOTE'] },
  { name: 'Acme rollout — Elevate quote', status: 'UNDER_CUSTOMER_PARTNER_REVIEW', partnerSlug: 'elevate-consulting', contentType: ['PARTNER_QUOTE'] },
  { name: 'Sunrise LATAM — Nine Dots quote', status: 'APPROVED', partnerSlug: 'nine-dots-ventures', contentType: ['PARTNER_QUOTE'] },
  { name: 'Helix self-host — Meridian quote', status: 'REJECTED', partnerSlug: 'meridian-craft', contentType: ['CASE_STUDY'] },
];

const nodes = (r: any, key: string): any[] => (r?.[key]?.edges ?? []).map((e: any) => e.node);

async function main() {
  const client = new CoreApiClient({
    url: `${requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '')}/graphql`,
    headers: { Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}` },
  });

  // -- Partners (upsert by slug) --
  const existingPartners = nodes(
    await client.query({ partners: { __args: { filter: { slug: { in: PARTNERS.map((p) => p.slug) } }, first: 100 }, edges: { node: { id: true, slug: true } } } } as any),
    'partners',
  );
  const partnerIdBySlug = new Map<string, string>(existingPartners.map((n: any) => [n.slug, n.id]));
  for (const p of PARTNERS) {
    const data = {
      name: p.name, slug: p.slug, validationStage: p.validationStage, availability: p.availability,
      introduction: p.introduction, calendarLink: { primaryLinkUrl: p.calendarLink },
      deploymentExpertise: p.deploymentExpertise, region: p.region, languagesSpoken: p.languagesSpoken,
      partnerTier: p.partnerTier, partnerScope: p.partnerScope, typeOfTeam: p.typeOfTeam,
      country: p.country, city: p.city,
      skills: p.skills,
      linkedin: { primaryLinkUrl: linkedin(p.slug) },
      profilePicture: { primaryLinkUrl: avatar(p.slug) },
      ...(p.hourlyRateUsd != null ? { hourlyRate: usd(p.hourlyRateUsd) } : {}),
      ...(p.projectBudgetMinUsd != null ? { projectBudgetMin: usd(p.projectBudgetMinUsd) } : {}),
    };
    const id = partnerIdBySlug.get(p.slug);
    if (id) {
      await client.mutation({ updatePartner: { __args: { id, data }, id: true } } as any);
    } else {
      const r: any = await client.mutation({ createPartner: { __args: { data }, id: true } } as any);
      partnerIdBySlug.set(p.slug, r.createPartner.id);
    }
  }
  console.log(`[seed] partners: ${partnerIdBySlug.size}`);

  // -- Companies (upsert by name) --
  const companyIdByName = new Map<string, string>();
  for (const c of COMPANIES) {
    const existing = nodes(await client.query({ companies: { __args: { filter: { name: { eq: c.name } }, first: 1 }, edges: { node: { id: true } } } } as any), 'companies');
    let id = existing[0]?.id;
    if (!id) {
      const r: any = await client.mutation({ createCompany: { __args: { data: { name: c.name, domainName: { primaryLinkUrl: c.domain } } }, id: true } } as any);
      id = r.createCompany.id;
    }
    companyIdByName.set(c.name, id);
  }

  // -- People (upsert by firstName+lastName) --
  for (const person of PERSONS) {
    const existing = nodes(await client.query({ people: { __args: { filter: { name: { firstName: { eq: person.firstName } } }, first: 10 }, edges: { node: { id: true, name: { firstName: true, lastName: true } } } } } as any), 'people');
    const match = existing.find((n: any) => n.name?.firstName === person.firstName && n.name?.lastName === person.lastName);
    if (!match) {
      await client.mutation({ createPerson: { __args: { data: { name: { firstName: person.firstName, lastName: person.lastName }, emails: { primaryEmail: person.email }, city: person.city, companyId: companyIdByName.get(person.companyName) } }, id: true } } as any);
    }
  }

  // -- Opportunities (upsert by name) --
  const oppIdByName = new Map<string, string>();
  for (const o of OPPORTUNITIES) {
    const data: Record<string, unknown> = {
      name: o.name, stage: o.stage, companyId: companyIdByName.get(o.companyName),
      ...(o.partnerSlug ? { partnerId: partnerIdBySlug.get(o.partnerSlug) } : {}),
      ...(o.numberOfSeats != null ? { numberOfSeats: o.numberOfSeats } : {}),
      ...(o.hostingType ? { hostingType: o.hostingType } : {}),
      ...(o.subscriptionType ? { subscriptionType: o.subscriptionType } : {}),
      ...(o.subscriptionFrequency ? { subscriptionFrequency: o.subscriptionFrequency } : {}),
    };
    const existing = nodes(await client.query({ opportunities: { __args: { filter: { name: { eq: o.name } }, first: 1 }, edges: { node: { id: true } } } } as any), 'opportunities');
    let id = existing[0]?.id;
    if (id) {
      await client.mutation({ updateOpportunity: { __args: { id, data }, id: true } } as any);
    } else {
      const r: any = await client.mutation({ createOpportunity: { __args: { data }, id: true } } as any);
      id = r.createOpportunity.id;
    }
    oppIdByName.set(o.name, id);
  }
  console.log(`[seed] opportunities: ${oppIdByName.size}`);

  // -- Partner quotes (upsert by name) --
  let quoteCount = 0;
  for (const q of QUOTES) {
    const data = { name: q.name, status: q.status, contentType: q.contentType, partnerId: partnerIdBySlug.get(q.partnerSlug) };
    const existing = nodes(await client.query({ partnerContents: { __args: { filter: { name: { eq: q.name } }, first: 1 }, edges: { node: { id: true } } } } as any), 'partnerContents');
    if (existing[0]?.id) {
      await client.mutation({ updatePartnerContent: { __args: { id: existing[0].id, data }, id: true } } as any);
    } else {
      await client.mutation({ createPartnerContent: { __args: { data }, id: true } } as any);
    }
    quoteCount++;
  }
  console.log(`[seed] partner quotes: ${quoteCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
