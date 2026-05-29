import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

export const SUBMIT_PARTNER_APPLICATION_LOGIC_FUNCTION_ID =
  '7b1e2c5f-3a14-4f7d-8e91-0b5e2a3c4d76';

const PARTNER_COUNTRY_VALUES = new Set([
  'AFGHANISTAN','ALBANIA','ALGERIA','ANDORRA','ANGOLA','ANTIGUA_AND_BARBUDA','ARGENTINA','ARMENIA','AUSTRALIA','AUSTRIA','AZERBAIJAN','BAHAMAS','BAHRAIN','BANGLADESH','BARBADOS','BELARUS','BELGIUM','BELIZE','BENIN','BHUTAN','BOLIVIA','BOSNIA_AND_HERZEGOVINA','BOTSWANA','BRAZIL','BRUNEI','BULGARIA','BURKINA_FASO','BURUNDI','CAMBODIA','CAMEROON','CANADA','CAPE_VERDE','CENTRAL_AFRICAN_REPUBLIC','CHAD','CHILE','CHINA','COLOMBIA','COMOROS','CONGO','DR_CONGO','COSTA_RICA','CROATIA','CUBA','CYPRUS','CZECH_REPUBLIC','DENMARK','DJIBOUTI','DOMINICA','DOMINICAN_REPUBLIC','ECUADOR','EGYPT','EL_SALVADOR','EQUATORIAL_GUINEA','ERITREA','ESTONIA','ESWATINI','ETHIOPIA','FIJI','FINLAND','FRANCE','GABON','GAMBIA','GEORGIA','GERMANY','GHANA','GREECE','GRENADA','GUATEMALA','GUINEA','GUINEA_BISSAU','GUYANA','HAITI','HONDURAS','HUNGARY','ICELAND','INDIA','INDONESIA','IRAN','IRAQ','IRELAND','ISRAEL','ITALY','IVORY_COAST','JAMAICA','JAPAN','JORDAN','KAZAKHSTAN','KENYA','KIRIBATI','KOSOVO','KUWAIT','KYRGYZSTAN','LAOS','LATVIA','LEBANON','LESOTHO','LIBERIA','LIBYA','LIECHTENSTEIN','LITHUANIA','LUXEMBOURG','MADAGASCAR','MALAWI','MALAYSIA','MALDIVES','MALI','MALTA','MARSHALL_ISLANDS','MAURITANIA','MAURITIUS','MEXICO','MICRONESIA','MOLDOVA','MONACO','MONGOLIA','MONTENEGRO','MOROCCO','MOZAMBIQUE','MYANMAR','NAMIBIA','NAURU','NEPAL','NETHERLANDS','NEW_ZEALAND','NICARAGUA','NIGER','NIGERIA','NORTH_KOREA','NORTH_MACEDONIA','NORWAY','OMAN','PAKISTAN','PALAU','PALESTINE','PANAMA','PAPUA_NEW_GUINEA','PARAGUAY','PERU','PHILIPPINES','POLAND','PORTUGAL','QATAR','ROMANIA','RUSSIA','RWANDA','SAINT_KITTS_AND_NEVIS','SAINT_LUCIA','SAINT_VINCENT','SAMOA','SAN_MARINO','SAO_TOME_AND_PRINCIPE','SAUDI_ARABIA','SENEGAL','SERBIA','SEYCHELLES','SIERRA_LEONE','SINGAPORE','SLOVAKIA','SLOVENIA','SOLOMON_ISLANDS','SOMALIA','SOUTH_AFRICA','SOUTH_KOREA','SOUTH_SUDAN','SPAIN','SRI_LANKA','SUDAN','SURINAME','SWEDEN','SWITZERLAND','SYRIA','TAIWAN','TAJIKISTAN','TANZANIA','THAILAND','TIMOR_LESTE','TOGO','TONGA','TRINIDAD_AND_TOBAGO','TUNISIA','TURKEY','TURKMENISTAN','TUVALU','UGANDA','UKRAINE','UNITED_ARAB_EMIRATES','UNITED_KINGDOM','UNITED_STATES','URUGUAY','UZBEKISTAN','VANUATU','VATICAN','VENEZUELA','VIETNAM','YEMEN','ZAMBIA','ZIMBABWE',
] as const);

const PARTNER_LANGUAGE_VALUES = new Set([
  'ENGLISH','FRENCH','GERMAN','SPANISH','PORTUGUESE','ITALIAN','DUTCH','ARABIC','CHINESE','JAPANESE','RUSSIAN','HINDI',
] as const);

const PARTNER_SCOPE_VALUES = new Set([
  'APPS','DATA_MODEL','DATA_MIGRATION','HOSTING_ENVIRONMENT','WORKFLOWS',
] as const);

const PARTNER_DEPLOYMENT_VALUES = new Set(['CLOUD','SELF_HOST'] as const);
const PARTNER_TYPE_OF_TEAM_VALUES = new Set(['SOLO','AGENCY'] as const);

export type SubmitPartnerApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  domainName?: string;
  linkedin?: string;
  city?: string;
  country?: string;
  languages?: string[];
  typeOfTeam?: string;
  partnerScope?: string[];
  skills?: string[];
  deploymentExpertise?: string[];
  hourlyRate?: number;
  projectBudgetMin?: number;
  calendarLink?: string;
  workspaceUrl?: string;
  customerReferences?: string;
};

export type SubmitPartnerApplicationResult =
  | { ok: true; created: boolean; partnerId: string }
  | { ok: false; reason: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validate(input: SubmitPartnerApplicationInput): string | null {
  if (!isNonEmptyString(input.firstName)) return 'invalid_input';
  if (typeof input.lastName !== 'string') return 'invalid_input';
  if (!isNonEmptyString(input.email)) return 'invalid_input';
  if (!isNonEmptyString(input.companyName)) return 'invalid_input';
  if (input.country !== undefined && !PARTNER_COUNTRY_VALUES.has(input.country as never)) return 'invalid_input';
  if (input.languages !== undefined) {
    if (!Array.isArray(input.languages)) return 'invalid_input';
    if (!input.languages.every((l) => PARTNER_LANGUAGE_VALUES.has(l as never))) return 'invalid_input';
  }
  if (input.partnerScope !== undefined) {
    if (!Array.isArray(input.partnerScope)) return 'invalid_input';
    if (!input.partnerScope.every((s) => PARTNER_SCOPE_VALUES.has(s as never))) return 'invalid_input';
  }
  if (input.deploymentExpertise !== undefined) {
    if (!Array.isArray(input.deploymentExpertise)) return 'invalid_input';
    if (!input.deploymentExpertise.every((d) => PARTNER_DEPLOYMENT_VALUES.has(d as never))) return 'invalid_input';
  }
  if (input.typeOfTeam !== undefined && !PARTNER_TYPE_OF_TEAM_VALUES.has(input.typeOfTeam as never)) return 'invalid_input';
  return null;
}

function toMicros(usd: number | undefined): { amountMicros: number; currencyCode: 'USD' } | undefined {
  if (typeof usd !== 'number' || !Number.isFinite(usd) || usd < 0) return undefined;
  return { amountMicros: Math.round(usd * 1_000_000), currencyCode: 'USD' };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildApplicationNotes(input: SubmitPartnerApplicationInput): string | null {
  const lines: string[] = [];
  if (isNonEmptyString(input.workspaceUrl)) lines.push(`Workspace URL: ${input.workspaceUrl.trim()}`);
  if (isNonEmptyString(input.customerReferences)) {
    lines.push('Customer references:');
    lines.push(input.customerReferences.trim());
  }
  return lines.length > 0 ? lines.join('\n') : null;
}

type PartnerFieldsForUpsert = {
  name: string;
  linkedin?: { primaryLinkUrl: string };
  city?: string;
  country?: string;
  languagesSpoken?: string[];
  typeOfTeam?: string;
  partnerScope?: string[];
  skills?: string[];
  deploymentExpertise?: string[];
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
  if (input.country !== undefined) fields.country = input.country;
  if (input.languages !== undefined && input.languages.length > 0) fields.languagesSpoken = input.languages;
  if (input.typeOfTeam !== undefined) fields.typeOfTeam = input.typeOfTeam;
  if (input.partnerScope !== undefined && input.partnerScope.length > 0) fields.partnerScope = input.partnerScope;
  if (input.skills !== undefined && input.skills.length > 0) fields.skills = input.skills.filter(isNonEmptyString);
  if (input.deploymentExpertise !== undefined && input.deploymentExpertise.length > 0) fields.deploymentExpertise = input.deploymentExpertise;
  const hourly = toMicros(input.hourlyRate);
  if (hourly) fields.hourlyRate = hourly;
  const min = toMicros(input.projectBudgetMin);
  if (min) fields.projectBudgetMin = min;
  if (isNonEmptyString(input.calendarLink)) fields.calendarLink = { primaryLinkUrl: input.calendarLink.trim() };
  const notes = buildApplicationNotes(input);
  if (notes !== null) fields.applicationNotes = notes;
  return fields;
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
  const expectedSecret = process.env.PARTNER_APPLICATION_SECRET?.trim();
  if (!isNonEmptyString(expectedSecret)) {
    return { ok: false, reason: 'unauthorized' };
  }
  const providedSecret = headers[APPLICATION_SECRET_HEADER];
  if (providedSecret !== expectedSecret) {
    return { ok: false, reason: 'unauthorized' };
  }

  if (typeof rawInput !== 'object' || rawInput === null) {
    return { ok: false, reason: 'invalid_input' };
  }
  const input = rawInput as SubmitPartnerApplicationInput;

  const validationError = validate(input);
  if (validationError !== null) return { ok: false, reason: validationError };

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
    } as any);

    const existingEdge = (personLookup as any)?.people?.edges?.[0]?.node as
      | { id: string; partner: { id: string; company: { id: string } | null } | null }
      | undefined;

    if (existingEdge && existingEdge.partner) {
      const partnerId = existingEdge.partner.id;
      await client.mutation({
        updatePartner: {
          __args: { id: partnerId, data: partnerFields },
          id: true,
        },
      } as any);
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
      } as any);
      return { ok: true, created: false, partnerId };
    }

    const companyData: Record<string, unknown> = { name: input.companyName.trim() };
    if (isNonEmptyString(input.domainName)) {
      companyData.domainName = { primaryLinkUrl: input.domainName.trim() };
    }
    const companyResult = await client.mutation({
      createCompany: { __args: { data: companyData }, id: true },
    } as any);
    const companyId = (companyResult as any).createCompany.id as string;

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
    } as any);
    const partnerId = (partnerResult as any).createPartner.id as string;

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
      } as any);
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
      } as any);
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
