import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { z } from 'zod';

import { slugify } from '../scripts/slugify';

export const SUBMIT_PARTNER_APPLICATION_LOGIC_FUNCTION_ID =
  '7b1e2c5f-3a14-4f7d-8e91-0b5e2a3c4d76';

const PARTNER_COUNTRY_VALUES = [
  'AFGHANISTAN','ALBANIA','ALGERIA','ANDORRA','ANGOLA','ANTIGUA_AND_BARBUDA','ARGENTINA','ARMENIA','AUSTRALIA','AUSTRIA','AZERBAIJAN','BAHAMAS','BAHRAIN','BANGLADESH','BARBADOS','BELARUS','BELGIUM','BELIZE','BENIN','BHUTAN','BOLIVIA','BOSNIA_AND_HERZEGOVINA','BOTSWANA','BRAZIL','BRUNEI','BULGARIA','BURKINA_FASO','BURUNDI','CAMBODIA','CAMEROON','CANADA','CAPE_VERDE','CENTRAL_AFRICAN_REPUBLIC','CHAD','CHILE','CHINA','COLOMBIA','COMOROS','CONGO','DR_CONGO','COSTA_RICA','CROATIA','CUBA','CYPRUS','CZECH_REPUBLIC','DENMARK','DJIBOUTI','DOMINICA','DOMINICAN_REPUBLIC','ECUADOR','EGYPT','EL_SALVADOR','EQUATORIAL_GUINEA','ERITREA','ESTONIA','ESWATINI','ETHIOPIA','FIJI','FINLAND','FRANCE','GABON','GAMBIA','GEORGIA','GERMANY','GHANA','GREECE','GRENADA','GUATEMALA','GUINEA','GUINEA_BISSAU','GUYANA','HAITI','HONDURAS','HUNGARY','ICELAND','INDIA','INDONESIA','IRAN','IRAQ','IRELAND','ISRAEL','ITALY','IVORY_COAST','JAMAICA','JAPAN','JORDAN','KAZAKHSTAN','KENYA','KIRIBATI','KOSOVO','KUWAIT','KYRGYZSTAN','LAOS','LATVIA','LEBANON','LESOTHO','LIBERIA','LIBYA','LIECHTENSTEIN','LITHUANIA','LUXEMBOURG','MADAGASCAR','MALAWI','MALAYSIA','MALDIVES','MALI','MALTA','MARSHALL_ISLANDS','MAURITANIA','MAURITIUS','MEXICO','MICRONESIA','MOLDOVA','MONACO','MONGOLIA','MONTENEGRO','MOROCCO','MOZAMBIQUE','MYANMAR','NAMIBIA','NAURU','NEPAL','NETHERLANDS','NEW_ZEALAND','NICARAGUA','NIGER','NIGERIA','NORTH_KOREA','NORTH_MACEDONIA','NORWAY','OMAN','PAKISTAN','PALAU','PALESTINE','PANAMA','PAPUA_NEW_GUINEA','PARAGUAY','PERU','PHILIPPINES','POLAND','PORTUGAL','QATAR','ROMANIA','RUSSIA','RWANDA','SAINT_KITTS_AND_NEVIS','SAINT_LUCIA','SAINT_VINCENT','SAMOA','SAN_MARINO','SAO_TOME_AND_PRINCIPE','SAUDI_ARABIA','SENEGAL','SERBIA','SEYCHELLES','SIERRA_LEONE','SINGAPORE','SLOVAKIA','SLOVENIA','SOLOMON_ISLANDS','SOMALIA','SOUTH_AFRICA','SOUTH_KOREA','SOUTH_SUDAN','SPAIN','SRI_LANKA','SUDAN','SURINAME','SWEDEN','SWITZERLAND','SYRIA','TAIWAN','TAJIKISTAN','TANZANIA','THAILAND','TIMOR_LESTE','TOGO','TONGA','TRINIDAD_AND_TOBAGO','TUNISIA','TURKEY','TURKMENISTAN','TUVALU','UGANDA','UKRAINE','UNITED_ARAB_EMIRATES','UNITED_KINGDOM','UNITED_STATES','URUGUAY','UZBEKISTAN','VANUATU','VATICAN','VENEZUELA','VIETNAM','YEMEN','ZAMBIA','ZIMBABWE',
] as const;

const PARTNER_LANGUAGE_VALUES = [
  'ENGLISH','FRENCH','GERMAN','SPANISH','PORTUGUESE','ITALIAN','DUTCH','ARABIC','CHINESE','JAPANESE','RUSSIAN','HINDI',
] as const;

const PARTNER_SCOPE_VALUES = [
  'ADVISORY','SOLUTIONING','DEVELOPMENT','HOSTING','SUPPORT',
] as const;
const PARTNER_TYPE_OF_TEAM_VALUES = ['SOLO','AGENCY'] as const;

// The request contract. zod is the single source of truth: it validates the
// incoming body at runtime and the input type is inferred from it, so the two
// can never drift. Enum-valued fields are constrained to the same option sets
// the Partner object accepts.
export const submitPartnerApplicationSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string(),
  email: z.string().trim().min(1),
  companyName: z.string().trim().min(1),
  domainName: z.string().optional(),
  linkedin: z.string().optional(),
  city: z.string().optional(),
  country: z.enum(PARTNER_COUNTRY_VALUES).optional(),
  languages: z.array(z.enum(PARTNER_LANGUAGE_VALUES)).optional(),
  typeOfTeam: z.enum(PARTNER_TYPE_OF_TEAM_VALUES).optional(),
  partnerScope: z.array(z.enum(PARTNER_SCOPE_VALUES)).optional(),
  skills: z.array(z.string()).optional(),
  applicationNotes: z.string().optional(),
  hourlyRate: z.number().optional(),
  projectBudgetMin: z.number().optional(),
  calendarLink: z.string().optional(),
});

export type SubmitPartnerApplicationInput = z.infer<
  typeof submitPartnerApplicationSchema
>;

export type SubmitPartnerApplicationResult =
  | { ok: true; created: boolean; partnerId: string }
  | { ok: false; reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toMicros(usd: number | undefined): { amountMicros: number; currencyCode: 'USD' } | undefined {
  if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < 0) return undefined;
  return { amountMicros: Math.round(usd * 1_000_000), currencyCode: 'USD' };
}

function buildApplicationNotes(input: SubmitPartnerApplicationInput): string | null {
  return isNonEmptyString(input.applicationNotes) ? input.applicationNotes.trim() : null;
}

// Mirrors the subset of Partner{Create,Update}Input this handler writes. The
// enum-typed columns are narrowed from the validated string inputs below.
type PartnerFieldsForUpsert = {
  name: string;
  linkedin?: { primaryLinkUrl: string };
  city?: string;
  country?: CoreSchema.PartnerCountryEnum;
  languagesSpoken?: CoreSchema.PartnerLanguagesSpokenEnum[];
  typeOfTeam?: CoreSchema.PartnerTypeOfTeamEnum;
  partnerScope?: CoreSchema.PartnerPartnerScopeEnum[];
  skills?: string[];
  hourlyRate?: { amountMicros: number; currencyCode: 'USD' };
  projectBudgetMin?: { amountMicros: number; currencyCode: 'USD' };
  calendarLink?: { primaryLinkUrl: string };
  applicationNotes?: string | null;
};

function buildPartnerFields(input: SubmitPartnerApplicationInput): PartnerFieldsForUpsert {
  const fields: PartnerFieldsForUpsert = {
    name: input.companyName.trim(),
  };
  if (isNonEmptyString(input.linkedin)) fields.linkedin = { primaryLinkUrl: input.linkedin.trim() };
  if (isNonEmptyString(input.city)) fields.city = input.city.trim();
  // validate() has already checked these against the allowed value sets, so
  // narrowing the validated strings to their enum types here is sound.
  if (input.country !== undefined) fields.country = input.country as CoreSchema.PartnerCountryEnum;
  if (input.languages !== undefined && input.languages.length > 0)
    fields.languagesSpoken = input.languages as CoreSchema.PartnerLanguagesSpokenEnum[];
  if (input.typeOfTeam !== undefined) fields.typeOfTeam = input.typeOfTeam as CoreSchema.PartnerTypeOfTeamEnum;
  if (input.partnerScope !== undefined && input.partnerScope.length > 0)
    fields.partnerScope = input.partnerScope as CoreSchema.PartnerPartnerScopeEnum[];
  if (input.skills !== undefined && input.skills.length > 0) fields.skills = input.skills.filter(isNonEmptyString);
  const hourly = toMicros(input.hourlyRate);
  if (hourly) fields.hourlyRate = hourly;
  const min = toMicros(input.projectBudgetMin);
  if (min) fields.projectBudgetMin = min;
  if (isNonEmptyString(input.calendarLink)) fields.calendarLink = { primaryLinkUrl: input.calendarLink.trim() };
  const notes = buildApplicationNotes(input);
  if (notes !== null) fields.applicationNotes = notes;
  return fields;
}

function normalizeDomainHost(
  value: string | null | undefined,
): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  const host = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/:?#].*$/, '');
  return host.length > 0 ? host : undefined;
}

// ponytail: matches active rows only — soft-deleted companies still hold the unique index; clear those with `yarn purge:prod`.
async function findOrCreateCompanyId(
  client: CoreApiClient,
  input: SubmitPartnerApplicationInput,
): Promise<string> {
  const domain = isNonEmptyString(input.domainName)
    ? input.domainName.trim()
    : undefined;
  const host = normalizeDomainHost(domain);

  if (host !== undefined) {
    // Broad ilike catches every stored URL form (bare, any protocol, paths, www).
    // Paginate to exhaustion so the real match is never paged out; client-side
    // normalization rejects false positives on each page.
    let cursor: string | null = null;
    do {
      const existing = await client.query({
        companies: {
          __args: {
            filter: { domainName: { primaryLinkUrl: { ilike: `%${host}%` } } },
            first: 20,
            ...(cursor !== null ? { after: cursor } : {}),
          },
          pageInfo: { hasNextPage: true, endCursor: true },
          edges: { node: { id: true, domainName: { primaryLinkUrl: true } } },
        },
      });
      const match = existing.companies?.edges?.find(
        (edge) => normalizeDomainHost(edge.node.domainName?.primaryLinkUrl) === host,
      );
      if (match !== undefined) {
        return match.node.id;
      }
      const pageInfo = existing.companies?.pageInfo;
      cursor = pageInfo?.hasNextPage ? (pageInfo.endCursor ?? null) : null;
    } while (cursor !== null);
  }

  const companyData: CoreSchema.CompanyCreateInput = {
    name: input.companyName.trim(),
  };
  if (domain !== undefined) {
    companyData.domainName = { primaryLinkUrl: domain };
  }
  const companyResult = await client.mutation({
    createCompany: { __args: { data: companyData }, id: true },
  });
  const companyId = companyResult.createCompany?.id;
  if (companyId === undefined) {
    throw new Error('createCompany did not return an id');
  }
  return companyId;
}

type SubmitPartnerApplicationEvent = {
  headers?: Record<string, string | undefined>;
  body?: unknown;
};

const APPLICATION_SECRET_HEADER = 'x-application-secret';

export const handler = async (
  event: SubmitPartnerApplicationEvent | SubmitPartnerApplicationInput,
): Promise<SubmitPartnerApplicationResult> => {
  // Accept either { body, headers } (HTTP) or a flat input object (direct call from tests).
  const looksLikeEvent =
    typeof event === 'object' &&
    event !== null &&
    ('body' in event || 'headers' in event);

  const headers = looksLikeEvent
    ? (event as SubmitPartnerApplicationEvent).headers ?? {}
    : {};
  const rawInput = looksLikeEvent
    ? (event as SubmitPartnerApplicationEvent).body
    : event;

  // Shared-secret guard. The Twenty SDK's isAuthRequired flag only accepts
  // user-session JWTs, not workspace API keys, so we authenticate at the
  // handler level via a custom header allowlisted in forwardedRequestHeaders.
  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET;
  if (!isNonEmptyString(expectedSecret)) {
    return { ok: false, reason: 'unauthorized' };
  }
  const providedSecret = headers[APPLICATION_SECRET_HEADER];
  if (providedSecret !== expectedSecret) {
    return { ok: false, reason: 'unauthorized' };
  }

  const parsed = submitPartnerApplicationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, reason: 'invalid_input' };
  }
  const input = parsed.data;

  try {
    const client = new CoreApiClient();
    const email = input.email.trim();
    const partnerFields = buildPartnerFields(input);

    const personLookup = await client.query({
      people: {
        __args: {
          filter: { emails: { primaryEmail: { eq: email } } },
          first: 1,
        },
        edges: {
          node: {
            id: true,
            partner: { id: true, company: { id: true } },
          },
        },
      },
    });

    const existingEdge = personLookup.people?.edges?.[0]?.node;

    if (existingEdge && existingEdge.partner) {
      const partnerId = existingEdge.partner.id;
      await client.mutation({
        updatePartner: {
          __args: { id: partnerId, data: partnerFields },
          id: true,
        },
      });
      await client.mutation({
        updatePerson: {
          __args: {
            id: existingEdge.id,
            data: {
              name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
            },
          },
          id: true,
        },
      });
      return { ok: true, created: false, partnerId };
    }

    const companyId = await findOrCreateCompanyId(client, input);

    const partnerResult = await client.mutation({
      createPartner: {
        __args: {
          data: {
            ...partnerFields,
            slug: slugify(input.companyName),
            validationStage: 'APPLICATION',
            reviewed: false,
            partnerTier: 'NEW',
            companyId,
          },
        },
        id: true,
      },
    });
    const partnerId = partnerResult.createPartner?.id;
    if (partnerId === undefined) {
      throw new Error('createPartner did not return an id');
    }

    if (existingEdge) {
      await client.mutation({
        updatePerson: {
          __args: {
            id: existingEdge.id,
            data: {
              partnerId,
              name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
            },
          },
          id: true,
        },
      });
    } else {
      await client.mutation({
        createPerson: {
          __args: {
            data: {
              name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
              emails: { primaryEmail: email },
              partnerId,
              companyId,
            },
          },
          id: true,
        },
      });
    }

    return { ok: true, created: true, partnerId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
};

export default defineLogicFunction({
  universalIdentifier: SUBMIT_PARTNER_APPLICATION_LOGIC_FUNCTION_ID,
  name: 'submit-partner-application',
  description: 'Receive a partner application from the website and idempotently upsert Partner / Person / Company.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/partner-applications',
    httpMethod: 'POST',
    isAuthRequired: false,
    forwardedRequestHeaders: [APPLICATION_SECRET_HEADER],
  },
});
