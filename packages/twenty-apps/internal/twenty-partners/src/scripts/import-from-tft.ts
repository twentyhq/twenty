// Import partners, opportunities and partner quotes FROM the TFT workspace INTO
// this (local) workspace. Idempotent: re-running upserts by natural key
// (partner=slug, opportunity=tftOpportunityId, quote=name).
//
// TFT (source) is read over RAW GraphQL fetch: its custom fields/filters are not
// in the SDK's generated (local) genql schema, so CoreApiClient cannot build
// queries for them. The local (target) workspace is written via CoreApiClient,
// exactly like seed.ts. Two separate credential sets, no collision:
//   TFT  -> TFT_API_URL / TFT_API_KEY      (raw fetch, explicit Bearer)
//   local-> TWENTY_API_URL / TWENTY_API_KEY (CoreApiClient reads these from env)
//
// The local server rate-limits API calls (~100 / 60s), so existence checks are
// batched into one `in` query per object (like seed.ts) and writes are paced.
//
// DRY-RUN BY DEFAULT: reads everything, writes nothing, and reports both what it
// WOULD upsert and the distinct TFT SELECT values it saw (flagging any value not
// covered by a local field option, which would otherwise fail a real write).
// Set IMPORT_APPLY=1 to actually write to the local workspace.
//
//   TFT_API_URL=https://twentyfortwenty.twenty.com TFT_API_KEY=<tft key> \
//   TWENTY_API_URL=http://localhost:2020 TWENTY_API_KEY=<local key> \
//   [IMPORT_APPLY=1] \
//   yarn vitest run --config vitest.seed.config.ts src/scripts/import-from-tft.ts

import { CoreApiClient } from 'twenty-client-sdk/core';
import { describe, it } from 'vitest';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} env var`);
  return value;
};

const APPLY = process.env.IMPORT_APPLY === '1';

// Raw GraphQL against TFT. The generated CoreApiClient is bound to the LOCAL
// schema and cannot serialise TFT's custom fields/filters, so read TFT untyped.
const tftQuery = async (query: string): Promise<any> => {
  const url = `${requireEnv('TFT_API_URL').replace(/\/$/, '')}/graphql`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireEnv('TFT_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  const json: any = await response.json();
  if (json.errors?.length) {
    throw new Error(`TFT query failed: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
};

// TFT opportunity.stage -> our matchStatus (the 4 early stages collapse to TO_BE_MATCHED)
const STAGE_TO_MATCH_STATUS: Record<string, string> = {
  INTRODUCED_TO_A_PARTNER: 'INTRODUCED_TO_A_PARTNER',
  WORKING_WITH_A_PARTNER: 'WORKING_WITH_A_PARTNER',
  WON: 'WON',
  LOST: 'LOST',
  RECONNECT_LATER: 'RECONNECT_LATER',
  IDENTIFIED: 'TO_BE_MATCHED',
  MET: 'TO_BE_MATCHED',
  SOLUTIONING: 'TO_BE_MATCHED',
  ADVANCED: 'TO_BE_MATCHED',
};

// TFT person.partnerStage -> our Partner.validationStage
const PARTNER_STAGE_TO_VALIDATION: Record<string, string> = {
  APPLICATION: 'APPLICATION',
  POTENTIAL_PARTNER: 'POTENTIAL',
  PARTNER: 'VALIDATED',
  FORMER_PARTNER: 'FORMER',
  REJECTED: 'REJECTED',
};

// Local SELECT option sets, for preflight coverage checks (a TFT value not in
// these would fail a real write). Keep in sync with src/objects + src/fields.
const LOCAL_OPTIONS: Record<string, Set<string>> = {
  partnerTier: new Set(['NEW', 'INTERMEDIATE', 'ADVANCED']),
  partnerScope: new Set(['APPS', 'DATA_MODEL', 'DATA_MIGRATION', 'HOSTING_ENVIRONMENT', 'WORKFLOWS']),
  typeOfTeam: new Set(['SOLO', 'AGENCY']),
  hostingType: new Set(['CLOUD', 'SELF_HOSTING']),
  subscriptionType: new Set(['PRO', 'ORG', 'ENT']),
  subscriptionFrequency: new Set(['MONTHLY', 'ANNUAL']),
  quoteStatus: new Set(['WIP', 'INTERVIEW_SCHEDULED', 'UNDER_CUSTOMER_PARTNER_REVIEW', 'APPROVED', 'REJECTED']),
};

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const edges = (result: any, key: string): any[] =>
  (result?.[key]?.edges ?? []).map((e: any) => e.node);

const uniq = (values: (string | undefined | null)[]): string[] =>
  [...new Set(values.filter((v): v is string => !!v))];

describe('import from TFT', () => {
  it('imports partners, opportunities and partner quotes (idempotent)', async () => {
    console.log(`[import] mode: ${APPLY ? 'APPLY (writing to local)' : 'DRY-RUN (no writes)'}`);
    const local = new CoreApiClient();

    // Pace writes to stay under the local server's ~100 req/60s limit.
    let writes = 0;
    const pace = async () => {
      if (APPLY && writes++ > 0) await new Promise((r) => setTimeout(r, 750));
    };

    // Distinct TFT values seen, for the preflight coverage report.
    const seen: Record<string, Set<string>> = {
      partnerStage: new Set(),
      partnerTier: new Set(),
      partnerScope: new Set(),
      typeOfTeam: new Set(),
      oppStage: new Set(),
      hostingType: new Set(),
      subscriptionType: new Set(),
      subscriptionFrequency: new Set(),
      quoteStatus: new Set(),
      typeCustom: new Set(),
    };
    const note = (bucket: string, value?: string | null) => {
      if (value) seen[bucket].add(value);
    };

    // ---------------------------------------------------------------------
    // 1. Read all three TFT datasets (raw fetch; not rate-limited by local).
    // ---------------------------------------------------------------------
    const tftPeople = edges(
      await tftQuery(`query {
        people(first: 500, filter: { partnerStage: { in: ["APPLICATION","POTENTIAL_PARTNER","PARTNER","FORMER_PARTNER","REJECTED"] } }) {
          edges { node {
            id
            name { firstName lastName }
            emails { primaryEmail }
            city jobTitle
            linkedinLink { primaryLinkUrl }
            partnerStage partnerTier partnerScope partnerTypeOfTeam partnerIsAvailable partnerSkills
            partnerBudgetMinimum { amountMicros currencyCode }
            partnerBudgetAverage { amountMicros currencyCode }
            company { id name domainName { primaryLinkUrl } }
          } }
        }
      }`),
      'people',
    );
    const tftOpps = edges(
      await tftQuery(`query {
        opportunities(first: 500) {
          edges { node {
            id name numberOfSeats useCase hostingType subscriptionType subscriptionFrequence lostReason stage
            amount { amountMicros currencyCode }
            closeDate
            company { id name domainName { primaryLinkUrl } }
            partner { id }
          } }
        }
      }`),
      'opportunities',
    );
    const tftContent = edges(
      await tftQuery(`query {
        customerContents(first: 500) {
          edges { node { id name status approvalDate typeCustom partnerPerson { id } } }
        }
      }`),
      'customerContents',
    );
    const quotes = tftContent.filter((c: any) => Array.isArray(c.typeCustom) && c.typeCustom.includes('PARTNER_QUOTE'));
    console.log(`[import] TFT: ${tftPeople.length} partner-people, ${tftOpps.length} opportunities, ${quotes.length} partner quotes`);

    const personSlug = (p: any): string =>
      slugify([p.name?.firstName, p.name?.lastName].filter(Boolean).join(' ').trim() || 'Unknown partner') || p.id;

    // ---------------------------------------------------------------------
    // 2. Batched existence lookups against local (one `in` query per object).
    // ---------------------------------------------------------------------
    const partnerSlugs = uniq(tftPeople.map(personSlug));
    const partnerIdBySlug = new Map<string, string>(
      partnerSlugs.length
        ? edges(
            await local.query({
              partners: { __args: { filter: { slug: { in: partnerSlugs } }, first: 500 }, edges: { node: { id: true, slug: true } } },
            } as any),
            'partners',
          ).map((n: any) => [n.slug, n.id])
        : [],
    );

    const companyNames = uniq([...tftPeople.map((p: any) => p.company?.name), ...tftOpps.map((o: any) => o.company?.name)]);
    const companyIdByName = new Map<string, string>(
      companyNames.length
        ? edges(
            await local.query({
              companies: { __args: { filter: { name: { in: companyNames } }, first: 500 }, edges: { node: { id: true, name: true } } },
            } as any),
            'companies',
          ).map((n: any) => [n.name, n.id])
        : [],
    );

    const oppTftIds = uniq(tftOpps.filter((o: any) => o.name).map((o: any) => o.id));
    const oppIdByTftId = new Map<string, string>(
      oppTftIds.length
        ? edges(
            await local.query({
              opportunities: { __args: { filter: { tftOpportunityId: { in: oppTftIds } }, first: 500 }, edges: { node: { id: true, tftOpportunityId: true } } },
            } as any),
            'opportunities',
          ).map((n: any) => [n.tftOpportunityId, n.id])
        : [],
    );

    const quoteNames = uniq(quotes.map((q: any) => q.name || 'Partner quote'));
    const quoteIdByName = new Map<string, string>(
      quoteNames.length
        ? edges(
            await local.query({
              partnerQuotes: { __args: { filter: { name: { in: quoteNames } }, first: 500 }, edges: { node: { id: true, name: true } } },
            } as any),
            'partnerQuotes',
          ).map((n: any) => [n.name, n.id])
        : [],
    );

    // ---------------------------------------------------------------------
    // 3. Upsert. Writes are APPLY-gated and paced; in dry-run we resolve new
    //    ids to synthetic placeholders so relation mapping still exercises.
    // ---------------------------------------------------------------------
    const upsertCompany = async (name?: string, domain?: string): Promise<string | undefined> => {
      if (!name) return undefined;
      if (companyIdByName.has(name)) return companyIdByName.get(name);
      let id = `dry:company:${name}`;
      if (APPLY) {
        await pace();
        const created: any = await local.mutation({
          createCompany: {
            __args: { data: { name, ...(domain ? { domainName: { primaryLinkUrl: domain } } : {}) } },
            id: true,
          },
        } as any);
        id = created.createCompany.id;
      }
      companyIdByName.set(name, id);
      return id;
    };

    const budgetCurrency = (amount: any) =>
      amount?.amountMicros != null ? { amountMicros: amount.amountMicros, currencyCode: amount.currencyCode ?? 'USD' } : undefined;

    // -- Partners (upsert by slug) --
    const localPartnerIdByTftPersonId = new Map<string, string>();
    let partnersCreated = 0;
    let partnersUpdated = 0;
    for (const p of tftPeople) {
      note('partnerStage', p.partnerStage);
      note('partnerTier', p.partnerTier);
      (Array.isArray(p.partnerScope) ? p.partnerScope : []).forEach((s: string) => note('partnerScope', s));
      note('typeOfTeam', p.partnerTypeOfTeam);

      const slug = personSlug(p);
      const companyId = await upsertCompany(p.company?.name, p.company?.domainName?.primaryLinkUrl);
      const data: Record<string, unknown> = {
        name: [p.name?.firstName, p.name?.lastName].filter(Boolean).join(' ').trim() || 'Unknown partner',
        slug,
        validationStage: PARTNER_STAGE_TO_VALIDATION[p.partnerStage] ?? 'APPLICATION',
        availability: p.partnerIsAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
        ...(p.partnerTier ? { partnerTier: p.partnerTier } : {}),
        ...(Array.isArray(p.partnerScope) && p.partnerScope.length ? { partnerScope: p.partnerScope } : {}),
        ...(p.partnerTypeOfTeam ? { typeOfTeam: p.partnerTypeOfTeam } : {}),
        ...(Array.isArray(p.partnerSkills) && p.partnerSkills.length ? { skills: p.partnerSkills } : {}),
        ...(p.city ? { city: p.city } : {}),
        ...(budgetCurrency(p.partnerBudgetMinimum) ? { projectBudgetMin: budgetCurrency(p.partnerBudgetMinimum) } : {}),
        ...(budgetCurrency(p.partnerBudgetAverage) ? { projectBudgetTypical: budgetCurrency(p.partnerBudgetAverage) } : {}),
        ...(p.linkedinLink?.primaryLinkUrl ? { linkedin: { primaryLinkUrl: p.linkedinLink.primaryLinkUrl } } : {}),
        ...(companyId && APPLY ? { companyId } : {}),
      };

      let partnerId = partnerIdBySlug.get(slug);
      if (partnerId) {
        if (APPLY) {
          await pace();
          await local.mutation({ updatePartner: { __args: { id: partnerId, data }, id: true } } as any);
        }
        partnersUpdated++;
      } else {
        if (APPLY) {
          await pace();
          const created: any = await local.mutation({ createPartner: { __args: { data }, id: true } } as any);
          partnerId = created.createPartner.id;
        } else {
          partnerId = `dry:partner:${slug}`;
        }
        partnerIdBySlug.set(slug, partnerId as string);
        partnersCreated++;
      }
      localPartnerIdByTftPersonId.set(p.id, partnerId as string);
    }
    console.log(`[import] partners created=${partnersCreated} updated=${partnersUpdated}`);

    // -- Opportunities (upsert by tftOpportunityId) --
    let oppsCreated = 0;
    let oppsUpdated = 0;
    let oppsPartnerLinked = 0;
    for (const o of tftOpps) {
      if (!o.name) continue;
      note('oppStage', o.stage);
      note('hostingType', o.hostingType);
      note('subscriptionType', o.subscriptionType);
      note('subscriptionFrequency', o.subscriptionFrequence);

      const companyId = await upsertCompany(o.company?.name, o.company?.domainName?.primaryLinkUrl);
      const partnerId = o.partner?.id ? localPartnerIdByTftPersonId.get(o.partner.id) : undefined;
      if (partnerId) oppsPartnerLinked++;

      const data: Record<string, unknown> = {
        name: o.name,
        tftOpportunityId: o.id,
        matchStatus: STAGE_TO_MATCH_STATUS[o.stage] ?? 'TO_BE_MATCHED',
        ...(o.numberOfSeats != null ? { numberOfSeats: o.numberOfSeats } : {}),
        ...(o.useCase ? { useCase: o.useCase } : {}),
        ...(o.hostingType ? { hostingType: o.hostingType } : {}),
        ...(o.subscriptionType ? { subscriptionType: o.subscriptionType } : {}),
        ...(o.subscriptionFrequence ? { subscriptionFrequency: o.subscriptionFrequence } : {}),
        ...(o.lostReason ? { lostReason: o.lostReason } : {}),
        ...(o.amount?.amountMicros != null ? { amount: { amountMicros: o.amount.amountMicros, currencyCode: o.amount.currencyCode ?? 'USD' } } : {}),
        ...(o.closeDate ? { closeDate: o.closeDate } : {}),
        ...(companyId && APPLY ? { companyId } : {}),
        ...(partnerId && APPLY ? { partnerId } : {}),
      };

      const existingId = oppIdByTftId.get(o.id);
      if (existingId) {
        if (APPLY) {
          await pace();
          await local.mutation({ updateOpportunity: { __args: { id: existingId, data }, id: true } } as any);
        }
        oppsUpdated++;
      } else {
        if (APPLY) {
          await pace();
          await local.mutation({ createOpportunity: { __args: { data }, id: true } } as any);
        }
        oppsCreated++;
      }
    }
    console.log(`[import] opportunities created=${oppsCreated} updated=${oppsUpdated} (partner-linked=${oppsPartnerLinked})`);

    // -- Partner quotes (upsert by name) --
    let quotesCreated = 0;
    let quotesUpdated = 0;
    tftContent.forEach((c: any) => (Array.isArray(c.typeCustom) ? c.typeCustom : []).forEach((t: string) => note('typeCustom', t)));
    for (const q of quotes) {
      note('quoteStatus', q.status);
      const name = q.name || 'Partner quote';
      const partnerId = q.partnerPerson?.id ? localPartnerIdByTftPersonId.get(q.partnerPerson.id) : undefined;
      const data: Record<string, unknown> = {
        name,
        ...(q.status ? { status: q.status } : {}),
        ...(q.approvalDate ? { approvalDate: q.approvalDate } : {}),
        ...(partnerId && APPLY ? { partnerId } : {}),
      };
      const existingId = quoteIdByName.get(name);
      if (existingId) {
        if (APPLY) {
          await pace();
          await local.mutation({ updatePartnerQuote: { __args: { id: existingId, data }, id: true } } as any);
        }
        quotesUpdated++;
      } else {
        if (APPLY) {
          await pace();
          await local.mutation({ createPartnerQuote: { __args: { data }, id: true } } as any);
        }
        quotesCreated++;
      }
    }
    console.log(`[import] partner quotes created=${quotesCreated} updated=${quotesUpdated}`);

    // ---------------------------------------------------------------------
    // 4. Preflight: distinct TFT values vs local option coverage.
    // ---------------------------------------------------------------------
    const report = (label: string, bucket: string, optionKey?: string) => {
      const values = [...seen[bucket]].sort();
      const allowed = optionKey ? LOCAL_OPTIONS[optionKey] : undefined;
      const uncovered = allowed ? values.filter((v) => !allowed.has(v)) : [];
      console.log(
        `[preflight] ${label}: ${values.join(', ') || '(none)'}` +
          (uncovered.length ? `  ⚠️ NOT IN LOCAL OPTIONS: ${uncovered.join(', ')}` : ''),
      );
    };
    console.log('--- preflight: distinct TFT values seen ---');
    report('partnerStage (-> validationStage map)', 'partnerStage');
    report('partnerTier', 'partnerTier', 'partnerTier');
    report('partnerScope', 'partnerScope', 'partnerScope');
    report('typeOfTeam', 'typeOfTeam', 'typeOfTeam');
    report('opp stage (-> matchStatus map)', 'oppStage');
    report('hostingType', 'hostingType', 'hostingType');
    report('subscriptionType', 'subscriptionType', 'subscriptionType');
    report('subscriptionFrequency', 'subscriptionFrequency', 'subscriptionFrequency');
    report('quote status', 'quoteStatus', 'quoteStatus');
    report('customerContent typeCustom', 'typeCustom');
    const unmappedStages = [...seen.partnerStage].filter((s) => !(s in PARTNER_STAGE_TO_VALIDATION));
    const unmappedOpps = [...seen.oppStage].filter((s) => !(s in STAGE_TO_MATCH_STATUS));
    if (unmappedStages.length) console.log(`[preflight] ⚠️ partnerStage not mapped: ${unmappedStages.join(', ')}`);
    if (unmappedOpps.length) console.log(`[preflight] ⚠️ opp stage not mapped: ${unmappedOpps.join(', ')}`);
  });
});
