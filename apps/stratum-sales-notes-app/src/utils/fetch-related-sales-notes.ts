// Shared GraphQL helpers used by the three "Sales notes" tab list widgets
// (one each on Person, Company, Opportunity). Returns a normalised
// `RelatedSalesNote[]` regardless of which relation lookup we used, so the
// rendering layer is identical across the three components.

export type RelatedSalesNote = {
  id: string;
  name: string | null;
  status: string | null;
  createdAt: string | null;
  ownerLabel: string | null;
};

const getApiConfig = () => {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY ?? '';
  return { apiUrl, token };
};

const graphqlFetch = async (
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> => {
  const { apiUrl, token } = getApiConfig();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await response.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };
  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
};

// salesNote relation graphs vary slightly per object so we treat the three
// queries as separate functions rather than a generic one with conditional
// branches.
type RawSalesNoteNode = {
  id?: string | null;
  name?: string | null;
  status?: string | null;
  createdAt?: string | null;
  owner?: {
    name?: { firstName?: string | null; lastName?: string | null } | null;
  } | null;
};

const renderOwnerLabel = (node: RawSalesNoteNode): string | null => {
  const first = node.owner?.name?.firstName ?? '';
  const last = node.owner?.name?.lastName ?? '';
  const combined = `${first} ${last}`.trim();
  return combined.length > 0 ? combined : null;
};

const normalize = (node: RawSalesNoteNode): RelatedSalesNote => ({
  id: typeof node.id === 'string' ? node.id : '',
  name: node.name ?? null,
  status: node.status ?? null,
  createdAt: node.createdAt ?? null,
  ownerLabel: renderOwnerLabel(node),
});

// Person → salesNotes via salesNoteAttendee junction (M2M).
export const fetchSalesNotesForPerson = async (
  personId: string,
): Promise<RelatedSalesNote[]> => {
  const data = (await graphqlFetch(
    `query SalesNotesForPerson($id: UUID!) {
       salesNoteAttendees(filter: { personId: { eq: $id } }) {
         edges {
           node {
             salesNote {
               id
               name
               status
               createdAt
               owner { name { firstName lastName } }
             }
           }
         }
       }
     }`,
    { id: personId },
  )) as {
    salesNoteAttendees?: {
      edges?: { node?: { salesNote?: RawSalesNoteNode | null } | null }[] | null;
    } | null;
  };

  const edges = data?.salesNoteAttendees?.edges ?? [];
  const out: RelatedSalesNote[] = [];
  for (const edge of edges) {
    const sn = edge?.node?.salesNote;
    if (sn && typeof sn.id === 'string' && sn.id.length > 0) {
      out.push(normalize(sn));
    }
  }
  // Most-recent first; the GraphQL query above doesn't sort by createdAt.
  out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  return out;
};

// Company / Opportunity → salesNotes via direct M2O reverse (FK on salesNote).
const fetchSalesNotesByForeignKey = async (
  fkFieldName: 'companyId' | 'opportunityId',
  fkValue: string,
): Promise<RelatedSalesNote[]> => {
  const data = (await graphqlFetch(
    `query SalesNotesByFk($id: UUID!) {
       salesNotes(
         filter: { ${fkFieldName}: { eq: $id } }
         orderBy: [{ createdAt: DescNullsLast }]
       ) {
         edges {
           node {
             id
             name
             status
             createdAt
             owner { name { firstName lastName } }
           }
         }
       }
     }`,
    { id: fkValue },
  )) as {
    salesNotes?: { edges?: { node?: RawSalesNoteNode | null }[] | null } | null;
  };

  const edges = data?.salesNotes?.edges ?? [];
  const out: RelatedSalesNote[] = [];
  for (const edge of edges) {
    const sn = edge?.node;
    if (sn && typeof sn.id === 'string' && sn.id.length > 0) {
      out.push(normalize(sn));
    }
  }
  return out;
};

export const fetchSalesNotesForCompany = (
  companyId: string,
): Promise<RelatedSalesNote[]> =>
  fetchSalesNotesByForeignKey('companyId', companyId);

export const fetchSalesNotesForOpportunity = (
  opportunityId: string,
): Promise<RelatedSalesNote[]> =>
  fetchSalesNotesByForeignKey('opportunityId', opportunityId);
