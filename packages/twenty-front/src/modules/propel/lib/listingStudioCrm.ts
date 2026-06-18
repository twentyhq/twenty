import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { type StudioPropertyOption } from '@/propel/types/listingStudio';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// Entry B (start from a CRM owner/property) needs a property list to pick from.
// We read `properties` directly over the core GraphQL endpoint with the AGENT'S
// OWN session token — so the list respects their record visibility (propel-rls)
// exactly like the rest of the CRM. Same thin-fetch bridge the 1:1 Runner uses
// (oneOnOneCrm.ts) and the dialer dock (dialerCrmBridge.ts): a hand-written query
// against `${base}/graphql`, NOT the Apollo client.
//
// The actual prefill (reading every field off the chosen property) happens
// server-side in POST /listing-studio/start; here we only need enough to render a
// searchable picker (id + name + a couple of disambiguating fields).

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

type PropertyConnection = {
  properties?: {
    edges?: { node: StudioPropertyOption; cursor: string }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string };
  };
};

/**
 * Load properties for the entry-B picker, newest first. Optional `search`
 * substring-matches the name server-side. Capped at a few pages — the picker is a
 * typeahead, not an exhaustive list. Returns [] on any failure so the picker shows
 * an honest empty state rather than throwing.
 */
export const loadStudioProperties = async (
  search?: string,
): Promise<StudioPropertyOption[]> => {
  const out: StudioPropertyOption[] = [];
  let after: string | null = null;
  const filter =
    search !== undefined && search.trim() !== ''
      ? { name: { ilike: `%${search.trim()}%` } }
      : undefined;

  for (let i = 0; i < 3; i++) {
    const data: PropertyConnection | null = await graphql<PropertyConnection>(
      `query StudioProperties($filter: PropertyFilterInput, $after: String) {
         properties(first: 50, filter: $filter, orderBy: [{ createdAt: DescNullsLast }], after: $after) {
           edges { node { id name community bedrooms } cursor }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { filter, after },
    );
    const conn: PropertyConnection['properties'] = data?.properties;
    for (const e of conn?.edges ?? []) out.push(e.node);
    if (conn?.pageInfo?.hasNextPage !== true) break;
    after = conn?.pageInfo?.endCursor ?? null;
    if (after === null) break;
  }
  return out;
};
