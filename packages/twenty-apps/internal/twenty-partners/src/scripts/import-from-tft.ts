// Import partners, opportunities and partner quotes FROM the TFT workspace INTO
// this (local) workspace. Idempotent: re-running upserts by natural key
// (partner=slug, opportunity=tftOpportunityId, quote=name).
//
// TFT (source) is read over RAW GraphQL fetch: its custom fields/filters are not
// in the SDK's generated (local) genql schema, so CoreApiClient cannot build
// queries for them. The local (target) workspace is written via CoreApiClient,
// exactly like seed.ts. Two separate credential sets, no collision:
//   TFT  -> TFT_API_URL / TFT_API_KEY                         (raw fetch)
//   local-> TWENTY_PARTNERS_API_URL / TWENTY_PARTNERS_API_KEY (CoreApiClient)
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
//   TWENTY_PARTNERS_API_URL=http://localhost:2020 TWENTY_PARTNERS_API_KEY=<local key> \
//   [IMPORT_APPLY=1] \
//   tsx src/scripts/import-from-tft.ts

import { config } from 'dotenv';
config({ path: process.env.ENV_FILE ?? '.env.local' });

import { CoreApiClient } from 'twenty-client-sdk/core';

import { mapLegacyScope } from './partner-scope-map';
import { slugify } from './slugify';

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

// TFT opportunity.stage -> our standard Opportunity.stage (early TFT stages -> NEW)
const TFT_STAGE_TO_STAGE: Record<string, string> = {
  INTRODUCED_TO_A_PARTNER: 'SCREENING',
  WORKING_WITH_A_PARTNER: 'PROPOSAL',
  WON: 'CUSTOMER',
  LOST: 'NEW',
  RECONNECT_LATER: 'NEW',
  IDENTIFIED: 'NEW',
  MET: 'SCREENING',
  SOLUTIONING: 'MEETING',
  ADVANCED: 'PROPOSAL',
};

// TFT person.partnerStage -> our Partner.validationStage
const PARTNER_STAGE_TO_VALIDATION: Record<string, string> = {
  APPLICATION: 'APPLICATION',
  POTENTIAL_PARTNER: 'POTENTIAL',
  PARTNER: 'VALIDATED',
  FORMER_PARTNER: 'FORMER',
  REJECTED: 'REJECTED',
};

// TFT person.partnerTimezone -> our Partner.region (MULTI_SELECT). TFT's value is a
// coarse timezone band, not a geography, so each maps to every region it plausibly
// covers. OTHER carries no signal -> no region. Region stays empty if unmapped.
const TIMEZONE_TO_REGION: Record<string, string[]> = {
  AMERICAS: ['US', 'LATAM'],
  EMEA: ['EUROPE', 'MENA', 'AFRICA'],
  WEST_ASIA: ['MENA', 'APAC'],
  EAST_ASIA_OCEANIA: ['APAC'],
  OTHER: [],
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

const edges = (result: any, key: string): any[] =>
  (result?.[key]?.edges ?? []).map((e: any) => e.node);

const uniq = (values: (string | undefined | null)[]): string[] =>
  [...new Set(values.filter((v): v is string => !!v))];

// Normalize a domain for dedup. Twenty's company domain is a unique key but is
// stored with an https:// prefix, while TFT values vary, so compare on a canonical
// form (no protocol, no www, no trailing slash, lowercased).
const normDomain = (d?: string | null): string | undefined =>
  d
    ? d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '') || undefined
    : undefined;

// Distinct non-empty values across rows, for the preflight report. Flattens array
// fields (e.g. partnerScope, typeCustom) and stringifies, so scalar and
// multi-select fields share one path. Derived from the already-fetched source
// rows — no per-loop bookkeeping needed.
const distinct = <TRow>(rows: TRow[], pick: (row: TRow) => unknown): string[] =>
  [
    ...new Set(
      rows.flatMap((row) => {
        const value = pick(row);
        return Array.isArray(value) ? value : value != null ? [value] : [];
      }),
    ),
  ]
    .map(String)
    .sort();

async function main() {
  console.log(`[import] mode: ${APPLY ? 'APPLY (writing to local)' : 'DRY-RUN (no writes)'}`);
  const local = new CoreApiClient({
    url: `${requireEnv('TWENTY_PARTNERS_API_URL').replace(/\/$/, '')}/graphql`,
    headers: { Authorization: `Bearer ${requireEnv('TWENTY_PARTNERS_API_KEY')}` },
  });

  // Pace writes to stay under the local server's ~100 req/60s limit.
  let writes = 0;
  const pace = async () => {
    if (APPLY && writes++ > 0) await new Promise((r) => setTimeout(r, 750));
  };

  // ---------------------------------------------------------------------
  // 1. Read all three TFT datasets (raw fetch; not rate-limited by local).
  // ---------------------------------------------------------------------
  console.log('[import] fetching TFT people...');
  const tftPeople = edges(
    await tftQuery(`query {
      people(first: 500, filter: { partnerStage: { in: ["APPLICATION","POTENTIAL_PARTNER","PARTNER","FORMER_PARTNER","REJECTED"] } }) {
        edges { node {
          id
          name { firstName lastName }
          emails { primaryEmail }
          city jobTitle
          linkedinLink { primaryLinkUrl }
          partnerStage partnerTier partnerScope partnerTypeOfTeam partnerTimezone partnerIsAvailable partnerSkills
          partnerBudgetMinimum { amountMicros currencyCode }
          company { id name domainName { primaryLinkUrl } }
        } }
      }
    }`),
    'people',
  );
  console.log('[import] fetching TFT opportunities...');
  const tftOppsAll = edges(
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
  // Only import opportunities linked to a partner. The rest is TFT's general sales
  // pipeline (mostly LOST/IDENTIFIED) — noise for a partners app. Every partner
  // stage (INTRODUCED/WORKING) only ever appears on partner-linked opps anyway.
  const tftOpps = tftOppsAll.filter((o: any) => o.partner?.id);
  console.log(`[import] opportunities: ${tftOpps.length} partner-linked of ${tftOppsAll.length} total (skipping ${tftOppsAll.length - tftOpps.length} unlinked)`);
  console.log('[import] fetching TFT partner content...');
  const tftContent = edges(
    await tftQuery(`query {
      customerContents(first: 500) {
        edges { node {
          id name status approvalDate typeCustom
          interview { primaryLinkUrl }
          partnerPerson { id }
          customerCompany { id name domainName { primaryLinkUrl } }
          customerPerson { id }
        } }
      }
    }`),
    'customerContents',
  );
  // Import all content TYPES (quotes, case studies, logos) but only records that
  // involve a partner. Customer-only content (no partnerPerson) is noise for the
  // partners app; a partner-linked case study/quote should show on the partner.
  const contentRecords = tftContent.filter((c: any) => c.partnerPerson?.id);
  console.log(`[import] TFT: ${tftPeople.length} partner-people, ${tftOpps.length} opportunities, ${tftContent.length} content records`);
  console.log(`[import] partner content: ${contentRecords.length} partner-linked of ${tftContent.length} total (skipping ${tftContent.length - contentRecords.length} customer-only)`);

  const personSlug = (p: any): string =>
    slugify([p.name?.firstName, p.name?.lastName].filter(Boolean).join(' ').trim() || 'Unknown partner') || p.id;

  // ---------------------------------------------------------------------
  // 2. Batched existence lookups against local (one `in` query per object).
  // ---------------------------------------------------------------------
  console.log('[import] checking existing records in target workspace...');
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

  // Fetch existing companies and index by BOTH name and normalized domain. Twenty
  // enforces uniqueness on domain, so dedup must be domain-aware: the same company
  // can arrive under different names (e.g. "Acme" vs "acme.com") across TFT people,
  // opps and content, and creating a second one collides on the domain constraint.
  // Page through ALL companies (not just the first 500): these dedupe maps must
  // be complete, or upsertCompany would create domain-colliding duplicates for
  // companies that live beyond the first page in a larger workspace.
  const existingCompanies: any[] = [];
  let companiesCursor: string | undefined;
  for (;;) {
    const page: any = await local.query({
      companies: {
        __args: { filter: {}, first: 200, ...(companiesCursor ? { after: companiesCursor } : {}) },
        edges: { node: { id: true, name: true, domainName: { primaryLinkUrl: true } } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as any);
    existingCompanies.push(...edges(page, 'companies'));
    if (!page?.companies?.pageInfo?.hasNextPage) break;
    companiesCursor = page.companies.pageInfo.endCursor;
  }
  const companyIdByName = new Map<string, string>(existingCompanies.map((n: any) => [n.name, n.id]));
  const companyIdByDomain = new Map<string, string>();
  for (const c of existingCompanies) {
    const nd = normDomain(c.domainName?.primaryLinkUrl);
    if (nd && !companyIdByDomain.has(nd)) companyIdByDomain.set(nd, c.id);
  }

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

  // Unnamed content upserts by name, so a constant fallback would make every
  // unnamed record collide on one key (collapsing them on re-run). Key the
  // fallback on the TFT id so each unnamed record stays distinct.
  const contentName = (c: any): string => c.name || `Partner content ${c.id}`;
  const contentNames = uniq(contentRecords.map(contentName));
  const contentIdByName = new Map<string, string>(
    contentNames.length
      ? edges(
          await local.query({
            partnerContents: { __args: { filter: { name: { in: contentNames } }, first: 500 }, edges: { node: { id: true, name: true } } },
          } as any),
          'partnerContents',
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
    const nd = normDomain(domain);
    // Same company under a different name but same domain — reuse it.
    if (nd && companyIdByDomain.has(nd)) {
      const existingId = companyIdByDomain.get(nd) as string;
      companyIdByName.set(name, existingId);
      return existingId;
    }
    let id = `dry:company:${name}`;
    if (APPLY) {
      await pace();
      try {
        const created: any = await local.mutation({
          createCompany: {
            __args: { data: { name, ...(domain ? { domainName: { primaryLinkUrl: domain } } : {}) } },
            id: true,
          },
        } as any);
        id = created.createCompany.id;
      } catch (err) {
        // Fallback: createCompany failed, almost certainly because the domain
        // already exists (Twenty enforces a unique domain) on a company we
        // didn't index. Re-find it and reuse instead of failing the import.
        // `ilike` is a substring match — and the stored value carries an
        // https:// prefix so we can't `eq` the normalized form — so it can
        // return the wrong company ("acme.com" also matches "notacme.com" or
        // "acme.com.br"). Confirm an exact normalized-domain match before reuse.
        if (!nd) throw err;
        await pace();
        const candidates = edges(
          await local.query({
            companies: { __args: { filter: { domainName: { primaryLinkUrl: { ilike: `%${nd}%` } } }, first: 20 }, edges: { node: { id: true, domainName: { primaryLinkUrl: true } } } },
          } as any),
          'companies',
        );
        const match = candidates.find((c: any) => normDomain(c.domainName?.primaryLinkUrl) === nd);
        if (!match?.id) throw err;
        id = match.id;
        console.log(`[import] company "${name}" reused existing by domain ${nd}`);
      }
    }
    companyIdByName.set(name, id);
    if (nd) companyIdByDomain.set(nd, id);
    return id;
  };

  const budgetCurrency = (amount: any) =>
    amount?.amountMicros != null ? { amountMicros: amount.amountMicros, currencyCode: amount.currencyCode ?? 'USD' } : undefined;

  // Generic create/update dispatch shared by partners, opportunities and content.
  // Owns pacing + APPLY-gating + the create-vs-update branch, so each loop below
  // only builds its `data`. genql keys a mutation by the object name, so the
  // create<Object>/update<Object> names are derived from one argument. Companies
  // keep their own upsert (above) because of the domain-collision fallback.
  // Returns the row id: the real id on APPLY, a synthetic dry id otherwise so the
  // relation mapping in dry-run still resolves to a stable placeholder.
  const upsert = async (
    object: 'Partner' | 'Opportunity' | 'PartnerContent',
    existingId: string | undefined,
    data: Record<string, unknown>,
    dryKey: string,
  ): Promise<string> => {
    if (!APPLY) return existingId ?? `dry:${object}:${dryKey}`;
    await pace();
    if (existingId) {
      await local.mutation({ [`update${object}`]: { __args: { id: existingId, data }, id: true } } as any);
      return existingId;
    }
    const created: any = await local.mutation({ [`create${object}`]: { __args: { data }, id: true } } as any);
    return created[`create${object}`].id;
  };

  // -- Partners (upsert by slug) --
  console.log(`[import] upserting ${tftPeople.length} partners...`);
  const localPartnerIdByTftPersonId = new Map<string, string>();
  let partnersCreated = 0;
  let partnersUpdated = 0;
  let partnersDone = 0;
  for (const p of tftPeople) {
    const slug = personSlug(p);
    const companyId = await upsertCompany(p.company?.name, p.company?.domainName?.primaryLinkUrl);
    // Timezone band -> geographic region(s). Unmapped/OTHER -> no region.
    const region = TIMEZONE_TO_REGION[p.partnerTimezone] ?? [];
    // A partner scoped for hosting is, by definition, a self-host expert.
    const rawScope = Array.isArray(p.partnerScope) ? p.partnerScope : [];
    // Map legacy TFT categories to the validated set so the import never
    // re-introduces retired values.
    const scope = mapLegacyScope(rawScope);
    const deploymentExpertise = rawScope.includes('HOSTING_ENVIRONMENT') ? ['SELF_HOST'] : [];
    const sourcePrimaryEmail = p.emails?.primaryEmail?.trim();
    const data: Record<string, unknown> = {
      name: [p.name?.firstName, p.name?.lastName].filter(Boolean).join(' ').trim() || 'Unknown partner',
      slug,
      validationStage: PARTNER_STAGE_TO_VALIDATION[p.partnerStage] ?? 'APPLICATION',
      availability: p.partnerIsAvailable ? 'AVAILABLE' : 'UNAVAILABLE',
      // TFT has no language data; default everyone to English.
      languagesSpoken: ['ENGLISH'],
      ...(p.partnerTier ? { partnerTier: p.partnerTier } : {}),
      ...(scope.length ? { partnerScope: scope } : {}),
      ...(region.length ? { region } : {}),
      ...(deploymentExpertise.length ? { deploymentExpertise } : {}),
      ...(p.partnerTypeOfTeam ? { typeOfTeam: p.partnerTypeOfTeam } : {}),
      ...(Array.isArray(p.partnerSkills) && p.partnerSkills.length ? { skills: p.partnerSkills } : {}),
      ...(p.city ? { city: p.city } : {}),
      ...(budgetCurrency(p.partnerBudgetMinimum) ? { projectBudgetMin: budgetCurrency(p.partnerBudgetMinimum) } : {}),
      ...(p.linkedinLink?.primaryLinkUrl ? { linkedin: { primaryLinkUrl: p.linkedinLink.primaryLinkUrl } } : {}),
      ...(sourcePrimaryEmail ? { email: sourcePrimaryEmail } : {}),
      ...(companyId && APPLY ? { companyId } : {}),
    };

    const existingId = partnerIdBySlug.get(slug);
    const partnerId = await upsert('Partner', existingId, data, slug);
    if (existingId) {
      partnersUpdated++;
    } else {
      partnerIdBySlug.set(slug, partnerId);
      partnersCreated++;
    }
    localPartnerIdByTftPersonId.set(p.id, partnerId);
    partnersDone++;
    if (partnersDone % 10 === 0 || partnersDone === tftPeople.length)
      console.log(`[import] partners ${partnersDone}/${tftPeople.length} (created=${partnersCreated} updated=${partnersUpdated})`);
  }
  console.log(`[import] partners done: created=${partnersCreated} updated=${partnersUpdated}`);

  // -- Opportunities (upsert by tftOpportunityId) --
  console.log(`[import] upserting ${tftOpps.length} opportunities...`);
  let oppsCreated = 0;
  let oppsUpdated = 0;
  let oppsPartnerLinked = 0;
  let oppsDone = 0;
  for (const o of tftOpps) {
    if (!o.name) continue;
    const companyId = await upsertCompany(o.company?.name, o.company?.domainName?.primaryLinkUrl);
    const partnerId = o.partner?.id ? localPartnerIdByTftPersonId.get(o.partner.id) : undefined;
    if (partnerId) oppsPartnerLinked++;

    const data: Record<string, unknown> = {
      name: o.name,
      tftOpportunityId: o.id,
      stage: TFT_STAGE_TO_STAGE[o.stage] ?? 'NEW',
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
    await upsert('Opportunity', existingId, data, o.id);
    if (existingId) oppsUpdated++;
    else oppsCreated++;
    oppsDone++;
    if (oppsDone % 20 === 0 || oppsDone === tftOpps.length)
      console.log(`[import] opportunities ${oppsDone}/${tftOpps.length} (created=${oppsCreated} updated=${oppsUpdated})`);
  }
  console.log(`[import] opportunities done: created=${oppsCreated} updated=${oppsUpdated} (partner-linked=${oppsPartnerLinked})`);

  // -- Partner content (upsert by name) --
  console.log(`[import] upserting ${contentRecords.length} content records...`);
  let contentCreated = 0;
  let contentUpdated = 0;
  for (const c of contentRecords) {
    const name = contentName(c);
    const partnerId = c.partnerPerson?.id ? localPartnerIdByTftPersonId.get(c.partnerPerson.id) : undefined;
    const customerCompanyId = await upsertCompany(c.customerCompany?.name, c.customerCompany?.domainName?.primaryLinkUrl);
    const data: Record<string, unknown> = {
      name,
      ...(Array.isArray(c.typeCustom) && c.typeCustom.length ? { contentType: c.typeCustom } : {}),
      ...(c.status ? { status: c.status } : {}),
      ...(c.approvalDate ? { approvalDate: c.approvalDate } : {}),
      ...(c.interview?.primaryLinkUrl ? { interview: { primaryLinkUrl: c.interview.primaryLinkUrl } } : {}),
      ...(partnerId && APPLY ? { partnerId } : {}),
      ...(customerCompanyId && APPLY ? { customerCompanyId } : {}),
    };
    const existingId = contentIdByName.get(name);
    await upsert('PartnerContent', existingId, data, name);
    if (existingId) contentUpdated++;
    else contentCreated++;
  }
  console.log(`[import] partner content created=${contentCreated} updated=${contentUpdated}`);

  // ---------------------------------------------------------------------
  // 4. Preflight: distinct TFT values vs local option coverage. Derived
  //    directly from the fetched source rows (no per-loop bookkeeping).
  // ---------------------------------------------------------------------
  const report = (label: string, values: string[], optionKey?: string) => {
    const allowed = optionKey ? LOCAL_OPTIONS[optionKey] : undefined;
    const uncovered = allowed ? values.filter((v) => !allowed.has(v)) : [];
    console.log(
      `[preflight] ${label}: ${values.join(', ') || '(none)'}` +
        (uncovered.length ? `  ⚠️ NOT IN LOCAL OPTIONS: ${uncovered.join(', ')}` : ''),
    );
  };
  const partnerStages = distinct(tftPeople, (p: any) => p.partnerStage);
  const oppStages = distinct(tftOpps, (o: any) => o.stage);
  const timezones = distinct(tftPeople, (p: any) => p.partnerTimezone);
  console.log('--- preflight: distinct TFT values seen ---');
  report('partnerStage (-> validationStage map)', partnerStages);
  report('partnerTier', distinct(tftPeople, (p: any) => p.partnerTier), 'partnerTier');
  report('partnerScope', distinct(tftPeople, (p: any) => p.partnerScope), 'partnerScope');
  report('typeOfTeam', distinct(tftPeople, (p: any) => p.partnerTypeOfTeam), 'typeOfTeam');
  report('partnerTimezone (-> region map)', timezones);
  report('opp stage (-> stage map)', oppStages);
  report('hostingType', distinct(tftOpps, (o: any) => o.hostingType), 'hostingType');
  report('subscriptionType', distinct(tftOpps, (o: any) => o.subscriptionType), 'subscriptionType');
  report('subscriptionFrequency', distinct(tftOpps, (o: any) => o.subscriptionFrequence), 'subscriptionFrequency');
  report('quote status', distinct(contentRecords, (c: any) => c.status), 'quoteStatus');
  report('customerContent typeCustom', distinct(contentRecords, (c: any) => c.typeCustom));
  const unmappedStages = partnerStages.filter((s) => !(s in PARTNER_STAGE_TO_VALIDATION));
  const unmappedOpps = oppStages.filter((s) => !(s in TFT_STAGE_TO_STAGE));
  const unmappedTz = timezones.filter((t) => !(t in TIMEZONE_TO_REGION));
  if (unmappedStages.length) console.log(`[preflight] ⚠️ partnerStage not mapped: ${unmappedStages.join(', ')}`);
  if (unmappedOpps.length) console.log(`[preflight] ⚠️ opp stage not mapped: ${unmappedOpps.join(', ')}`);
  if (unmappedTz.length) console.log(`[preflight] ⚠️ partnerTimezone not mapped: ${unmappedTz.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
