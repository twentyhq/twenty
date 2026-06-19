// Deterministic ranker for the twenty-partner-application-triage skill.
//
// Ranks APPLICATION-stage partners by NET-NEW value vs the current VALIDATED set:
// geography and language we don't yet cover (weighted high), plus a "real Twenty
// work" proof signal read from the application notes. Skill volume is deliberately
// capped so generic dev shops that spray skill lists don't dominate.
//
// Reads creds from ~/.twenty/credentials.env. Emits ranked JSON to stdout.
// Run `tsx rank.ts --selftest` to verify scoring without hitting the API.
//
// ponytail: fixed weights + tier thresholds. Tune the WEIGHTS/THRESHOLDS dicts
// below if the ranking drifts; everything else is mechanical. Raw REST + own
// types on purpose: the codegen SDK schema only carries the Partner object after
// a local sync, so a typed client.query would not compile in a clean checkout.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const WEIGHTS = { geo: 3, lang: 3, scope: 1, skill: 1, skillCap: 3, proof: 6 };
const THRESHOLDS = { A: 12, B: 5 }; // >=A => A; >=B => B; else C. Any proof => at least A.

// "real Twenty work" signals in the free-text notes (the high-confidence axis).
const PROOF_WORKSPACE = /https?:\/\/[^\s]*(twenty|crm)[^\s]*/i;
const PROOF_CUSTOMERS = /(customers?\s+onboarded|real implementation|clients?\s+(moving|migrat)|delivered \d|named customer)/i;
const PROOF_MIGRATION = /(switch\w*|migrat\w*|moved|replac\w*|our crm|own crm|we use twenty|dogfood|managed service)/i;

const CRED_PATH = join(homedir(), '.twenty', 'credentials.env');
const HTTP_TIMEOUT_MS = 90_000;

type PersonRecord = {
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
  linkedinLink?: unknown;
};

type PartnerRecord = {
  name?: string | null;
  validationStage?: string | null;
  region?: unknown;
  country?: unknown;
  languagesSpoken?: unknown;
  partnerScope?: unknown;
  skills?: unknown;
  typeOfTeam?: string | null;
  applicationNotes?: unknown;
  callBookedAt?: unknown;
  persons?: PersonRecord[] | null;
  linkedin?: unknown;
  website?: unknown;
};

type PartnersPage = {
  data?: { partners?: PartnerRecord[] };
  pageInfo?: { hasNextPage?: boolean; endCursor?: string };
};

const loadCreds = (): { url: string; key: string } => {
  let raw: string;
  try {
    raw = readFileSync(CRED_PATH, 'utf8');
  } catch {
    throw new Error(
      `Missing ${CRED_PATH}. Copy the partners key from the app's .env.prod into it ` +
        '(TWENTY_PARTNERS_API_URL / TWENTY_PARTNERS_API_KEY).',
    );
  }
  const env: Record<string, string> = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  const url = env.TWENTY_PARTNERS_API_URL;
  const key = env.TWENTY_PARTNERS_API_KEY;
  if (!url || !key) {
    throw new Error('credentials.env is missing TWENTY_PARTNERS_API_URL or TWENTY_PARTNERS_API_KEY.');
  }
  return { url: url.replace(/\/$/, ''), key };
};

const fetchAllPartners = async (url: string, key: string): Promise<PartnerRecord[]> => {
  const recs: PartnerRecord[] = [];
  let after: string | undefined;
  for (;;) {
    const path = `${url}/rest/partners?limit=60&depth=1${after ? `&starting_after=${after}` : ''}`;
    const res = await fetch(path, {
      headers: { Authorization: `Bearer ${key}`, 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(HTTP_TIMEOUT_MS),
    });
    if (!res.ok) {
      const hint =
        res.status === 401 || res.status === 403
          ? ' — auth failed, check TWENTY_PARTNERS_API_KEY in ~/.twenty/credentials.env'
          : '';
      throw new Error(`Partners API ${res.status} ${res.statusText}${hint}`);
    }
    const body = (await res.json()) as PartnersPage;
    const page = body.data?.partners ?? [];
    recs.push(...page);
    if (body.pageInfo?.hasNextPage && page.length > 0 && body.pageInfo.endCursor) {
      after = body.pageInfo.endCursor;
      continue;
    }
    return recs;
  }
};

// Flatten any nested value into a set of lowercased non-empty string tokens.
const tok = (value: unknown): Set<string> => {
  const out = new Set<string>();
  if (value === null || value === undefined) return out;
  if (typeof value === 'string') {
    const s = value.trim().toLowerCase();
    if (s) out.add(s);
  } else if (Array.isArray(value)) {
    for (const item of value) for (const t of tok(item)) out.add(t);
  } else if (typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) for (const t of tok(item)) out.add(t);
  } else {
    out.add(String(value).toLowerCase());
  }
  return out;
};

const diffSorted = (value: Set<string>, base: Set<string>): string[] =>
  [...value].filter((x) => !base.has(x)).sort();

const notesStr = (rec: PartnerRecord): string => {
  const v = rec.applicationNotes;
  if (typeof v === 'string') return v;
  return v === null || v === undefined ? '' : JSON.stringify(v);
};

const linkUrl = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const u = (value as { primaryLinkUrl?: unknown }).primaryLinkUrl;
    return typeof u === 'string' ? u : null;
  }
  return null;
};

// Mirror Python truthiness so the linkedin `or` fallback ports exactly: "", 0,
// false, null/undefined, and EMPTY array/object are falsy (JS would treat {}/[] as
// truthy, which would diverge from rank.py's `p.linkedinLink or rec.linkedin`).
const pyTruthy = (v: unknown): boolean => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.length > 0;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
};

const contact = (rec: PartnerRecord): { name: string | null; email: string | null; linkedin: string | null } => {
  const persons = rec.persons ?? [];
  if (persons.length === 0) return { name: null, email: null, linkedin: linkUrl(rec.linkedin) };
  const p = persons[0];
  const full = [p.name?.firstName, p.name?.lastName].filter((x): x is string => Boolean(x)).join(' ') || null;
  const email = p.emails?.primaryEmail ?? null;
  // Python: `p.get("linkedinLink") or rec.get("linkedin")`, then normalize. Choose
  // the raw value with Python falsiness FIRST, normalize once after.
  const rawLinkedin = pyTruthy(p.linkedinLink) ? p.linkedinLink : rec.linkedin;
  return { name: full, email, linkedin: linkUrl(rawLinkedin) };
};

type Baseline = { geo: Set<string>; lang: Set<string>; scope: Set<string>; skill: Set<string> };

const baseline = (validated: PartnerRecord[]): Baseline => {
  const base: Baseline = { geo: new Set(), lang: new Set(), scope: new Set(), skill: new Set() };
  for (const r of validated) {
    for (const t of tok(r.region)) base.geo.add(t);
    for (const t of tok(r.country)) base.geo.add(t);
    for (const t of tok(r.languagesSpoken)) base.lang.add(t);
    for (const t of tok(r.partnerScope)) base.scope.add(t);
    for (const t of tok(r.skills)) base.skill.add(t);
  }
  return base;
};

type RankedEntry = {
  name: string | null | undefined;
  score: number;
  tier: 'A' | 'B' | 'C';
  new_geo: string[];
  new_lang: string[];
  new_scope: string[];
  new_skills: string[];
  proof: Record<string, boolean>;
  team: string | null | undefined;
  contact_name: string | null;
  email: string | null;
  linkedin: string | null;
  website: string | null;
  notes: string;
};

const scoreOne = (rec: PartnerRecord, base: Baseline): RankedEntry => {
  const newGeo = diffSorted(new Set([...tok(rec.region), ...tok(rec.country)]), base.geo);
  const newLang = diffSorted(tok(rec.languagesSpoken), base.lang);
  const newScope = diffSorted(tok(rec.partnerScope), base.scope);
  const newSkill = diffSorted(tok(rec.skills), base.skill);
  const notes = notesStr(rec);
  const proof = {
    workspace_url: PROOF_WORKSPACE.test(notes),
    customers: PROOF_CUSTOMERS.test(notes),
    migration: PROOF_MIGRATION.test(notes),
  };
  const hasProof = Object.values(proof).some(Boolean);
  const score =
    WEIGHTS.geo * newGeo.length +
    WEIGHTS.lang * newLang.length +
    WEIGHTS.scope * newScope.length +
    WEIGHTS.skill * Math.min(newSkill.length, WEIGHTS.skillCap) +
    (hasProof ? WEIGHTS.proof : 0);
  const tier: 'A' | 'B' | 'C' = hasProof || score >= THRESHOLDS.A ? 'A' : score >= THRESHOLDS.B ? 'B' : 'C';
  const { name, email, linkedin } = contact(rec);
  return {
    name: rec.name,
    score,
    tier,
    new_geo: newGeo,
    new_lang: newLang,
    new_scope: newScope,
    new_skills: newSkill,
    proof: Object.fromEntries(Object.entries(proof).filter(([, v]) => v)),
    team: rec.typeOfTeam,
    contact_name: name,
    email,
    linkedin,
    website: linkUrl(rec.website),
    notes: notes.trim().slice(0, 400),
  };
};

type RankResult = {
  validated_count: number;
  application_count: number;
  booking_state_wired: boolean;
  coverage: Record<string, string[]>;
  ranked: RankedEntry[];
};

const rank = (recs: PartnerRecord[]): RankResult => {
  const validated = recs.filter((r) => r.validationStage === 'VALIDATED');
  let apps = recs.filter((r) => r.validationStage === 'APPLICATION');
  // Forward-compat: once callBookedAt exists, narrow to the un-booked (the chase set).
  const hasBookedField = recs.some((r) => 'callBookedAt' in r);
  if (hasBookedField) apps = apps.filter((r) => !r.callBookedAt);
  const base = baseline(validated);
  const ranked = apps.map((r) => scoreOne(r, base)).sort((a, b) => b.score - a.score);
  return {
    validated_count: validated.length,
    application_count: apps.length,
    booking_state_wired: hasBookedField,
    coverage: Object.fromEntries(Object.entries(base).map(([k, v]) => [k, [...v].sort()])),
    ranked,
  };
};

const assert = (cond: boolean, msg: string): void => {
  if (!cond) throw new Error(`selftest failed: ${msg}`);
};

const selftest = (): void => {
  const baseRecs: PartnerRecord[] = [
    {
      validationStage: 'VALIDATED',
      country: ['france'],
      languagesSpoken: ['french', 'english'],
      partnerScope: ['development'],
      skills: ['react', 'postgres'],
    },
  ];
  const apps: PartnerRecord[] = [
    {
      validationStage: 'APPLICATION',
      name: 'gap+proof',
      country: ['germany'],
      languagesSpoken: ['german'],
      applicationNotes: 'Live workspace https://crm.acme.de — customers onboarded: Foo GmbH',
    },
    {
      validationStage: 'APPLICATION',
      name: 'skill-sprayer',
      skills: ['php', 'vue', 'kotlin', 'swift', 'laravel', 'mongodb'],
    },
    { validationStage: 'APPLICATION', name: 'empty' },
  ];
  const out = rank([...baseRecs, ...apps]).ranked;
  const order = out.map((r) => r.name);
  assert(JSON.stringify(order) === JSON.stringify(['gap+proof', 'skill-sprayer', 'empty']), JSON.stringify(order));
  assert(out[0].tier === 'A', JSON.stringify(out[0]));
  assert(out[1].score === WEIGHTS.skillCap, JSON.stringify(out[1])); // 6 new skills capped at 3
  assert(out[2].tier === 'C', JSON.stringify(out[2]));

  // linkedin fallback parity with Python `or`: an empty person link falls back to
  // the record link; a person link dict with a null url does NOT (the dict is
  // truthy in Python, so it wins and normalizes to null).
  const recLink = { primaryLinkUrl: 'https://li/rec', secondaryLinks: [] };
  const emptyDict = rank([
    { validationStage: 'APPLICATION', name: 'li', persons: [{ linkedinLink: {} }], linkedin: recLink },
  ]).ranked[0];
  assert(emptyDict.linkedin === 'https://li/rec', `empty person link should fall back: ${emptyDict.linkedin}`);
  const nullUrlDict = rank([
    { validationStage: 'APPLICATION', name: 'li2', persons: [{ linkedinLink: { primaryLinkUrl: null } }], linkedin: recLink },
  ]).ranked[0];
  assert(nullUrlDict.linkedin === null, `null-url person link should not fall back: ${nullUrlDict.linkedin}`);

  console.log('selftest ok:', order);
};

const main = async (): Promise<void> => {
  if (process.argv.includes('--selftest')) {
    selftest();
    return;
  }
  const { url, key } = loadCreds();
  const result = rank(await fetchAllPartners(url, key));
  console.log(JSON.stringify(result, null, 2));
};

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
