// Shared GraphQL helpers used by both target tabs (People + Companies).
// Runs in the front-component sandbox — raw fetch only (CoreApiClient
// breaks in the sandbox per sales-notes lessons #2).

// ─── Types ──────────────────────────────────────────────────────────────────

export type ResponseStatus =
  | 'TARGETED'
  | 'CONTACTED'
  | 'ENGAGED'
  | 'RESPONDED'
  | 'CONVERTED'
  | 'UNSUBSCRIBED';

export type TouchType =
  | 'EMAIL'
  | 'CALL'
  | 'MEETING'
  | 'MAIL'
  | 'EVENT'
  | 'OTHER';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

type FullName = { firstName?: string | null; lastName?: string | null } | null;

export type PersonRow = {
  id: string;
  name: FullName;
  jobTitle: string | null;
  company: { id: string; name: string | null } | null;
};

export type CompanyRow = {
  id: string;
  name: string | null;
  domainName: string | null;
};

export type AssigneeRow = {
  id: string;
  name: FullName;
} | null;

export type OpportunityRow = {
  id: string;
  name: string | null;
} | null;

export type CampaignMemberRow = {
  id: string;
  responseStatus: ResponseStatus | null;
  touchType: TouchType | null;
  priority: Priority | null;
  dateAdded: string | null;
  dateResponded: string | null;
  notes: string | null;
  targetPerson: PersonRow | null;
  targetCompany: CompanyRow | null;
  assignee: AssigneeRow;
  convertedToOpportunity: OpportunityRow;
};

// ─── GraphQL plumbing ───────────────────────────────────────────────────────

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

// ─── Fetch all CampaignMembers for a Campaign ───────────────────────────────
// Cap of 200 members per campaign. Filter to the morph variant we want
// client-side (cheaper than working out the right server-side operator for
// MORPH fields, and 200 rows is trivial). Order by dateAdded DESC.

const FETCH_QUERY = `
  query CampaignMembersForCampaign($campaignId: UUID!) {
    campaignMembers(
      filter: { campaignId: { eq: $campaignId } }
      orderBy: [{ dateAdded: DescNullsLast }]
      first: 200
    ) {
      edges {
        node {
          id
          responseStatus
          touchType
          priority
          dateAdded
          dateResponded
          notes
          targetPerson {
            id
            name { firstName lastName }
            jobTitle
            company { id name }
          }
          targetCompany {
            id
            name
            domainName { primaryLinkUrl }
          }
          assignee {
            id
            name { firstName lastName }
          }
          convertedToOpportunity {
            id
            name
          }
        }
      }
    }
  }
`;

type RawCompanyNode = {
  id?: string | null;
  name?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
} | null;

type RawNode = {
  id?: string | null;
  responseStatus?: ResponseStatus | null;
  touchType?: TouchType | null;
  priority?: Priority | null;
  dateAdded?: string | null;
  dateResponded?: string | null;
  notes?: string | null;
  targetPerson?: {
    id?: string | null;
    name?: FullName;
    jobTitle?: string | null;
    company?: { id?: string | null; name?: string | null } | null;
  } | null;
  targetCompany?: RawCompanyNode;
  assignee?: { id?: string | null; name?: FullName } | null;
  convertedToOpportunity?: { id?: string | null; name?: string | null } | null;
};

const normalize = (node: RawNode): CampaignMemberRow | null => {
  if (typeof node.id !== 'string' || node.id.length === 0) return null;
  const tp = node.targetPerson;
  const tc = node.targetCompany;
  return {
    id: node.id,
    responseStatus: node.responseStatus ?? null,
    touchType: node.touchType ?? null,
    priority: node.priority ?? null,
    dateAdded: node.dateAdded ?? null,
    dateResponded: node.dateResponded ?? null,
    notes: node.notes ?? null,
    targetPerson:
      tp != null && typeof tp.id === 'string' && tp.id.length > 0
        ? {
            id: tp.id,
            name: tp.name ?? null,
            jobTitle: tp.jobTitle ?? null,
            company:
              tp.company != null && typeof tp.company.id === 'string'
                ? { id: tp.company.id, name: tp.company.name ?? null }
                : null,
          }
        : null,
    targetCompany:
      tc != null && typeof tc.id === 'string' && tc.id.length > 0
        ? {
            id: tc.id,
            name: tc.name ?? null,
            domainName: tc.domainName?.primaryLinkUrl ?? null,
          }
        : null,
    assignee:
      node.assignee != null && typeof node.assignee.id === 'string'
        ? { id: node.assignee.id, name: node.assignee.name ?? null }
        : null,
    convertedToOpportunity:
      node.convertedToOpportunity != null &&
      typeof node.convertedToOpportunity.id === 'string'
        ? {
            id: node.convertedToOpportunity.id,
            name: node.convertedToOpportunity.name ?? null,
          }
        : null,
  };
};

export type TargetVariant = 'person' | 'company';

export const fetchCampaignMembersByVariant = async (
  campaignId: string,
  variant: TargetVariant,
): Promise<CampaignMemberRow[]> => {
  const data = (await graphqlFetch(FETCH_QUERY, { campaignId })) as {
    campaignMembers?: { edges?: { node?: RawNode | null }[] | null } | null;
  };
  const out: CampaignMemberRow[] = [];
  for (const edge of data?.campaignMembers?.edges ?? []) {
    const raw = edge?.node;
    if (raw == null) continue;
    const row = normalize(raw);
    if (row == null) continue;
    // Morph discriminator: include only rows whose target matches the variant.
    if (variant === 'person' && row.targetPerson == null) continue;
    if (variant === 'company' && row.targetCompany == null) continue;
    out.push(row);
  }
  return out;
};

// ─── Generic update + per-field wrappers ────────────────────────────────────

// Subset of CampaignMember columns we let callers patch from the front-component.
// Keep this narrow so we don't accidentally let UI code clobber campaignId,
// dateAdded, or other rarely-changed fields.
export type CampaignMemberPatch = {
  responseStatus?: ResponseStatus;
  touchType?: TouchType | null;
  priority?: Priority | null;
  dateResponded?: string | null;
  notes?: string | null;
  assigneeId?: string | null;
  convertedToOpportunityId?: string | null;
};

export const updateCampaignMember = async (
  campaignMemberId: string,
  patch: CampaignMemberPatch,
): Promise<void> => {
  await graphqlFetch(
    `mutation UpdateCampaignMember($id: UUID!, $data: CampaignMemberUpdateInput!) {
       updateCampaignMember(id: $id, data: $data) { id }
     }`,
    { id: campaignMemberId, data: patch },
  );
};

export const updateCampaignMemberResponseStatus = async (
  campaignMemberId: string,
  responseStatus: ResponseStatus,
): Promise<void> => {
  // When a rep flips status to RESPONDED or CONVERTED, stamp dateResponded
  // if not already set — saves a click and keeps the timeline accurate.
  const shouldStampDate =
    responseStatus === 'RESPONDED' || responseStatus === 'CONVERTED';

  const patch: CampaignMemberPatch = { responseStatus };
  if (shouldStampDate) {
    patch.dateResponded = new Date().toISOString();
  }
  await updateCampaignMember(campaignMemberId, patch);
};

export const updateCampaignMemberTouchType = async (
  campaignMemberId: string,
  touchType: TouchType,
): Promise<void> => {
  await updateCampaignMember(campaignMemberId, { touchType });
};

// ─── Create a CampaignMember linking a Person or Company to a Campaign ──────

export const createCampaignMember = async (params: {
  campaignId: string;
  variant: TargetVariant;
  targetId: string;
}): Promise<string> => {
  const data: Record<string, unknown> = {
    campaignId: params.campaignId,
    dateAdded: new Date().toISOString(),
    responseStatus: 'TARGETED',
  };
  if (params.variant === 'person') {
    data.targetPersonId = params.targetId;
  } else {
    data.targetCompanyId = params.targetId;
  }

  const resp = (await graphqlFetch(
    `mutation CreateCampaignMember($data: CampaignMemberCreateInput!) {
       createCampaignMember(data: $data) { id }
     }`,
    { data },
  )) as { createCampaignMember?: { id?: string } };

  const newId = resp.createCampaignMember?.id;
  if (typeof newId !== 'string' || newId.length === 0) {
    throw new Error('createCampaignMember returned no id');
  }
  return newId;
};

// ─── Search People / Companies for the add picker ───────────────────────────

export const searchPeople = async (
  query: string,
  excludeIds: string[],
): Promise<PersonRow[]> => {
  // ilike on Person.name composite needs subfield indexing; the simplest
  // cross-field search is on each subfield ORed together. Keep it modest —
  // the picker is meant to refine, not replace, the standard People view.
  const pattern = `%${query}%`;
  const data = (await graphqlFetch(
    `query PeopleSearch($q: String!) {
       people(
         filter: {
           or: [
             { name: { firstName: { ilike: $q } } }
             { name: { lastName:  { ilike: $q } } }
             { jobTitle: { ilike: $q } }
           ]
         }
         orderBy: [{ updatedAt: DescNullsLast }]
         first: 15
       ) {
         edges {
           node {
             id
             name { firstName lastName }
             jobTitle
             company { id name }
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    people?: {
      edges?:
        | {
            node?: {
              id?: string | null;
              name?: FullName;
              jobTitle?: string | null;
              company?: { id?: string | null; name?: string | null } | null;
            } | null;
          }[]
        | null;
    } | null;
  };
  const out: PersonRow[] = [];
  for (const edge of data?.people?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string' || n.id.length === 0) continue;
    if (excludeIds.includes(n.id)) continue;
    out.push({
      id: n.id,
      name: n.name ?? null,
      jobTitle: n.jobTitle ?? null,
      company:
        n.company != null && typeof n.company.id === 'string'
          ? { id: n.company.id, name: n.company.name ?? null }
          : null,
    });
  }
  return out;
};

export const searchCompanies = async (
  query: string,
  excludeIds: string[],
): Promise<CompanyRow[]> => {
  const pattern = `%${query}%`;
  const data = (await graphqlFetch(
    `query CompaniesSearch($q: String!) {
       companies(
         filter: { name: { ilike: $q } }
         orderBy: [{ updatedAt: DescNullsLast }]
         first: 15
       ) {
         edges {
           node {
             id
             name
             domainName { primaryLinkUrl }
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    companies?: { edges?: { node?: RawCompanyNode }[] | null } | null;
  };
  const out: CompanyRow[] = [];
  for (const edge of data?.companies?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string' || n.id.length === 0) continue;
    if (excludeIds.includes(n.id)) continue;
    out.push({
      id: n.id,
      name: n.name ?? null,
      domainName: n.domainName?.primaryLinkUrl ?? null,
    });
  }
  return out;
};

// ─── Search workspaceMembers (for assignee picker) ──────────────────────────

export type WorkspaceMemberSearchHit = {
  id: string;
  name: FullName;
};

export const searchWorkspaceMembers = async (
  query: string,
): Promise<WorkspaceMemberSearchHit[]> => {
  const pattern = `%${query}%`;
  const data = (await graphqlFetch(
    `query WorkspaceMembersSearch($q: String!) {
       workspaceMembers(
         filter: {
           or: [
             { name: { firstName: { ilike: $q } } }
             { name: { lastName:  { ilike: $q } } }
           ]
         }
         orderBy: [{ name: { firstName: AscNullsLast } }]
         first: 10
       ) {
         edges {
           node {
             id
             name { firstName lastName }
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    workspaceMembers?: {
      edges?: { node?: { id?: string | null; name?: FullName } | null }[] | null;
    } | null;
  };
  const out: WorkspaceMemberSearchHit[] = [];
  for (const edge of data?.workspaceMembers?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string' || n.id.length === 0) continue;
    out.push({ id: n.id, name: n.name ?? null });
  }
  return out;
};

// ─── Search opportunities (for convertedToOpportunity picker) ───────────────

export type OpportunitySearchHit = {
  id: string;
  name: string | null;
  stage: string | null;
};

export const searchOpportunities = async (
  query: string,
): Promise<OpportunitySearchHit[]> => {
  const pattern = `%${query}%`;
  const data = (await graphqlFetch(
    `query OpportunitiesSearch($q: String!) {
       opportunities(
         filter: { name: { ilike: $q } }
         orderBy: [{ updatedAt: DescNullsLast }]
         first: 15
       ) {
         edges {
           node {
             id
             name
             stage
           }
         }
       }
     }`,
    { q: pattern },
  )) as {
    opportunities?: {
      edges?:
        | {
            node?: {
              id?: string | null;
              name?: string | null;
              stage?: string | null;
            } | null;
          }[]
        | null;
    } | null;
  };
  const out: OpportunitySearchHit[] = [];
  for (const edge of data?.opportunities?.edges ?? []) {
    const n = edge?.node;
    if (n == null || typeof n.id !== 'string' || n.id.length === 0) continue;
    out.push({
      id: n.id,
      name: n.name ?? null,
      stage: n.stage ?? null,
    });
  }
  return out;
};
