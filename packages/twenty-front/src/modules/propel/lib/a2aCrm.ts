import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { splitE164 } from '@/dialer-dock/utils/dialerCrmBridge';
import {
  type CounterpartyDraft,
  type CounterpartyPerson,
} from '@/propel/types/a2a';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// The A2A Studio reads/creates the counterparty broker as a Person directly over
// the core GraphQL endpoint, with the AGENT'S OWN session token — so it respects
// their record visibility (propel-rls) exactly like the rest of the CRM. This
// mirrors the dialer dock's CRM bridge (dialerCrmBridge.ts) and the 1:1 runner's
// oneOnOneCrm.ts: a thin fetch to `${base}/graphql`, NOT the Apollo client (the
// standard `createPerson` op + `people` search are the only things we touch — no
// route, object, or field is added). We reuse `splitE164` from the dialer bridge
// so phones are stored SPLIT (primaryPhoneCallingCode + primaryPhoneNumber) the
// way Twenty stores them.

const graphql = async <T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T | null> => {
  const token = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;
  if (token === undefined || token === '') {
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

type PersonNode = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  jobTitle?: string | null;
  emails?: { primaryEmail?: string | null } | null;
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
  } | null;
};

const PERSON_NODE = `
  id
  name { firstName lastName }
  jobTitle
  emails { primaryEmail }
  phones { primaryPhoneNumber primaryPhoneCallingCode }
`;

// Re-join a SPLIT phone into a display string (e.g. "+971503469348"). SendPanel
// passes this to the route so doc-service can WhatsApp the link/PDF.
const joinPhone = (node: PersonNode): string | null => {
  const cc = node.phones?.primaryPhoneCallingCode ?? '';
  const num = node.phones?.primaryPhoneNumber ?? '';
  const joined = `${cc}${num}`.trim();
  return joined === '' ? null : joined;
};

const toCounterparty = (node: PersonNode): CounterpartyPerson => {
  const first = node.name?.firstName ?? '';
  const last = node.name?.lastName ?? '';
  const name = `${first} ${last}`.trim();
  return {
    id: node.id,
    name: name === '' ? 'Unnamed contact' : name,
    email: node.emails?.primaryEmail ?? null,
    phone: joinPhone(node),
    brokerage: node.jobTitle ?? null,
  };
};

/**
 * Search People by a free-text term (matches first/last name or primary email).
 * Returns up to 12 candidates so the ContactRunner can offer "link existing"
 * before creating a duplicate. Returns [] on any failure (honest empty state).
 */
export const searchCounterpartyPeople = async (
  term: string,
): Promise<CounterpartyPerson[]> => {
  const q = term.trim();
  if (q.length < 2) {
    return [];
  }
  const data = await graphql<{ people?: { edges?: { node: PersonNode }[] } }>(
    `query A2ASearchPeople($filter: PersonFilterInput) {
       people(filter: $filter, first: 12) {
         edges { node { ${PERSON_NODE} } }
       }
     }`,
    {
      filter: {
        or: [
          { name: { firstName: { ilike: `%${q}%` } } },
          { name: { lastName: { ilike: `%${q}%` } } },
          { emails: { primaryEmail: { ilike: `%${q}%` } } },
        ],
      },
    },
  );
  return (data?.people?.edges ?? []).map((edge) => toCounterparty(edge.node));
};

/**
 * Create the counterparty broker as a Person (name + email + split phone +
 * brokerage→jobTitle), reusing the dialer bridge's E.164 split so the phone is
 * stored the way the CRM stores phones. Returns the new record (as a
 * CounterpartyPerson) or null on any failure — the drawer reports add-failed
 * rather than guessing.
 */
export const createCounterpartyPerson = async (
  draft: CounterpartyDraft,
): Promise<CounterpartyPerson | null> => {
  const data: Record<string, unknown> = {
    name: {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
    },
  };
  if (draft.email.trim() !== '') {
    data.emails = { primaryEmail: draft.email.trim() };
  }
  if (draft.phone.trim() !== '') {
    const { callingCode, national } = splitE164(draft.phone);
    if (national.length > 0) {
      data.phones = {
        primaryPhoneNumber: national,
        primaryPhoneCallingCode: callingCode,
      };
    }
  }
  if (draft.brokerage.trim() !== '') {
    data.jobTitle = draft.brokerage.trim();
  }

  const res = await graphql<{ createPerson?: PersonNode }>(
    `mutation A2ACreatePerson($data: PersonCreateInput!) {
       createPerson(data: $data) { ${PERSON_NODE} }
     }`,
    { data },
  );
  return res?.createPerson != null ? toCounterparty(res.createPerson) : null;
};

/**
 * Link an existing counterparty Person onto the agreementDocument's
 * `counterpartyPerson` relation (the Plane-2 schema add). Writes the FK scalar
 * directly. Returns true on success. This is the one app-object write the hero
 * makes over GraphQL; everything else flows through the /a2a/* routes.
 */
export const linkCounterpartyToAgreement = async (
  agreementDocumentId: string,
  counterpartyPersonId: string,
): Promise<boolean> => {
  const res = await graphql<{ updateAgreementDocument?: { id?: string } }>(
    `mutation A2ALinkCounterparty($id: UUID!, $data: AgreementDocumentUpdateInput!) {
       updateAgreementDocument(id: $id, data: $data) { id }
     }`,
    { id: agreementDocumentId, data: { counterpartyPersonId } },
  );
  return res?.updateAgreementDocument?.id != null;
};
