import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { type ReviewLine } from '@/propel/types/oneOnOne';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

// The Runner reads/writes the `leadReviewLine` custom object directly over the
// core GraphQL endpoint, with the AGENT'S OWN session token — so reads respect
// their record visibility (propel-rls) exactly like the rest of the CRM. This
// mirrors the dialer dock's CRM bridge (dialerCrmBridge.ts): a thin fetch to
// `${base}/graphql`, NOT the Apollo client (these app-object types aren't in the
// generated core schema, so a hand-written query is the simplest faithful port).
//
// We touch ONLY the two operations the in-sandbox Runner used: a paged
// `leadReviewLines` read and a scalar `updateLeadReviewLine` write. No backend
// route, object, or field is added or changed.

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

const LINE_NODE = `
  id
  clientName
  leadObjectType
  leadRecordId
  stageSnapshot
  sourceSnapshot
  segmentSnapshot
  detailsSnapshot
  lastActivityAt
  notes
  nextAction
  discussed
  lineStatus
  closedSincePrep
  budgetSnapshot { amountMicros currencyCode }
`;

type LineConnection = {
  leadReviewLines?: {
    edges?: { node: ReviewLine; cursor: string }[];
    pageInfo?: { hasNextPage?: boolean; endCursor?: string };
  };
};

/**
 * Load every review line for a meeting (paged, capped at 20 pages × 100 like the
 * in-sandbox Runner), ordered by position. Returns [] on any failure so the
 * Runner shows an honest empty/wrap-up state rather than throwing.
 */
export const loadReviewLines = async (
  meetingId: string,
): Promise<ReviewLine[]> => {
  const out: ReviewLine[] = [];
  let after: string | null = null;
  for (let i = 0; i < 20; i++) {
    const data: LineConnection | null = await graphql<LineConnection>(
      `query OooReviewLines($filter: LeadReviewLineFilterInput, $after: String) {
         leadReviewLines(first: 100, filter: $filter, orderBy: [{ position: AscNullsLast }], after: $after) {
           edges { node { ${LINE_NODE} } cursor }
           pageInfo { hasNextPage endCursor }
         }
       }`,
      { filter: { meetingId: { eq: meetingId } }, after },
    );
    const conn: LineConnection['leadReviewLines'] = data?.leadReviewLines;
    for (const e of conn?.edges ?? []) out.push(e.node);
    if (conn?.pageInfo?.hasNextPage !== true) break;
    after = conn?.pageInfo?.endCursor ?? null;
    if (after === null) break;
  }
  return out;
};

/**
 * Patch a single review line's scalar fields (notes / nextAction / discussed /
 * lineStatus only — never composite/relation fields). Mirrors the in-sandbox
 * Runner's updateLeadReviewLine. Returns true on success.
 */
export const updateReviewLine = async (
  id: string,
  patch: Pick<
    Partial<ReviewLine>,
    'notes' | 'nextAction' | 'discussed' | 'lineStatus'
  >,
): Promise<boolean> => {
  const data: Record<string, unknown> = {};
  if ('notes' in patch) data.notes = patch.notes ?? null;
  if ('nextAction' in patch) data.nextAction = patch.nextAction ?? null;
  if ('discussed' in patch) data.discussed = patch.discussed ?? false;
  if ('lineStatus' in patch) data.lineStatus = patch.lineStatus;

  const res = await graphql<{ updateLeadReviewLine?: { id?: string } }>(
    `mutation OooUpdateReviewLine($id: UUID!, $data: LeadReviewLineUpdateInput!) {
       updateLeadReviewLine(id: $id, data: $data) { id }
     }`,
    { id, data },
  );
  return res?.updateLeadReviewLine?.id != null;
};
