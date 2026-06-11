import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// CRM-side half of the dialer ⇄ dock bridge. The embedded dialer never calls
// the CRM API; it posts requests to the dock and the dock answers them here
// with the AGENT'S OWN session token — so lookups respect the agent's record
// visibility (RLS), exactly like anything else they do in the CRM.
//
// Phone matching reality (verified against staging 2026-06): Twenty stores
// Person phones SPLIT — primaryPhoneCallingCode '+971' + primaryPhoneNumber
// '503469348' (national digits). An exact match on a full E.164 can therefore
// never hit; we prefilter server-side with an ilike on the last digits and
// verify client-side by comparing digit tails.

export type DialerLookupResult = {
  number: string;
  personId?: string;
  name?: string;
};

type PersonNode = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
  } | null;
};

const digitsOf = (value: string): string => value.replace(/\D/g, '');

// Normalized for matching: digits only, leading zeros dropped (local "050…"
// notation). Match rule: exact equality OR a full suffix relation with the
// shorter side ≥ 8 digits. A plain last-N comparison is collision-prone
// (+44 7503469348 and +971 503469348 share a 9-digit tail); a suffix
// relation is not. Kept in lockstep with voice-service's findPeopleByPhone.
const normDigits = (value: string): string =>
  digitsOf(value).replace(/^0+/, '');

const personDigits = (person: PersonNode): string =>
  normDigits(
    `${person.phones?.primaryPhoneCallingCode ?? ''}${person.phones?.primaryPhoneNumber ?? ''}`,
  );

const personMatchesNumber = (person: PersonNode, number: string): boolean => {
  const candidate = personDigits(person);
  const target = normDigits(number);
  if (candidate.length === 0 || target.length === 0) {
    return false;
  }
  if (candidate === target) {
    return true;
  }
  const shorter = Math.min(candidate.length, target.length);
  return (
    shorter >= 8 && (candidate.endsWith(target) || target.endsWith(candidate))
  );
};

const personDisplayName = (person: PersonNode): string =>
  `${person.name?.firstName ?? ''} ${person.name?.lastName ?? ''}`.trim();

const graphql = async <T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> => {
  const token = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;
  if (token === undefined) {
    return null;
  }
  try {
    const response = await fetch(`${REACT_APP_SERVER_BASE_URL}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      return null;
    }
    const json = (await response.json()) as { data?: T };
    return json.data ?? null;
  } catch {
    return null;
  }
};

/**
 * Resolve dialer numbers to Person records. One round-trip: OR-combined ilike
 * prefilter on the last 7 digits of every number, then exact digit-tail
 * verification per candidate. A number is echoed back verbatim so the dialer
 * can key its backfill on it; unmatched numbers return without identity.
 */
export const lookupPeopleByNumbers = async (
  numbers: string[],
): Promise<DialerLookupResult[]> => {
  const valid = numbers.filter((number) => digitsOf(number).length >= 5);
  if (valid.length === 0) {
    return [];
  }

  const data = await graphql<{
    people?: { edges?: { node: PersonNode }[] };
  }>(
    `query DialerPeopleByPhoneTails($filter: PersonFilterInput) {
       people(filter: $filter, first: 60) {
         edges { node {
           id
           name { firstName lastName }
           phones { primaryPhoneNumber primaryPhoneCallingCode }
         } }
       }
     }`,
    {
      filter: {
        or: valid.map((number) => ({
          phones: {
            primaryPhoneNumber: { ilike: `%${digitsOf(number).slice(-7)}%` },
          },
        })),
      },
    },
  );
  const candidates = (data?.people?.edges ?? []).map((edge) => edge.node);

  return valid.map((number) => {
    const matches = candidates.filter((person) =>
      personMatchesNumber(person, number),
    );
    // Duplicate records for one number exist in practice — prefer the first
    // match that actually carries a name over a bare phone-only record.
    const best =
      matches.find((person) => personDisplayName(person).length > 0) ??
      matches[0];
    if (best === undefined) {
      return { number };
    }
    const name = personDisplayName(best);
    return {
      number,
      personId: best.id,
      ...(name.length > 0 ? { name } : {}),
    };
  });
};

// Longest-prefix calling-code split for createPerson — covers the markets the
// brokerage actually calls; an unknown prefix stores the full digits with an
// empty calling code rather than guessing wrong.
const CALLING_CODES = [
  '+971', '+966', '+965', '+974', '+973', '+968', '+962', '+961', '+880',
  '+994', '+995', '+996', '+998', '+212', '+213', '+216', '+218', '+249',
  '+351', '+353', '+352', '+356', '+357', '+380', '+375', '+420', '+421',
  '+20', '+27', '+30', '+31', '+32', '+33', '+34', '+36', '+39', '+40',
  '+41', '+43', '+44', '+45', '+46', '+47', '+48', '+49', '+60', '+61',
  '+62', '+63', '+64', '+65', '+66', '+81', '+82', '+84', '+86', '+90',
  '+91', '+92', '+93', '+94', '+98', '+234', '+254', '+7', '+1',
].sort((a, b) => b.length - a.length);

export const splitE164 = (
  number: string,
): { callingCode: string; national: string } => {
  const digits = digitsOf(number);
  const e164 = `+${digits}`;
  const callingCode = CALLING_CODES.find((code) => e164.startsWith(code));
  if (callingCode === undefined) {
    return { callingCode: '', national: digits };
  }
  return { callingCode, national: e164.slice(callingCode.length) };
};

/**
 * Create a Person carrying the dialed number (split into calling code +
 * national digits, matching how the CRM stores phones). Returns the new
 * record id, or null on any failure — the dock reports that back to the
 * dialer as add-failed rather than guessing.
 */
export const createPersonWithPhone = async (
  number: string,
): Promise<string | null> => {
  const { callingCode, national } = splitE164(number);
  if (national.length === 0) {
    return null;
  }
  const data = await graphql<{ createPerson?: { id?: string } }>(
    `mutation DialerCreatePerson($data: PersonCreateInput!) {
       createPerson(data: $data) { id }
     }`,
    {
      data: {
        phones: {
          primaryPhoneNumber: national,
          primaryPhoneCallingCode: callingCode,
        },
      },
    },
  );
  return data?.createPerson?.id ?? null;
};

/**
 * Client-side CRM navigation from outside the router tree. pushState + a
 * synthetic popstate lets react-router pick the change up WITHOUT a full
 * reload — a reload would remount the dialer iframe and drop its SIP
 * registration (and any active call).
 */
export const navigateCrm = (path: string): void => {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return;
  }
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};
