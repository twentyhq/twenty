import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  stampPartnerUserFromPartner,
  type PartnerChildObject,
} from 'src/logic-functions/stamp-partner-user-on-child';

const PAGE_SIZE = 200;

const CHILD_QUERIES: {
  childObject: PartnerChildObject;
  listKey: 'partnerLinks' | 'partnerServices' | 'partnerContents';
}[] = [
  { childObject: 'partnerLink', listKey: 'partnerLinks' },
  { childObject: 'partnerService', listKey: 'partnerServices' },
  { childObject: 'partnerContent', listKey: 'partnerContents' },
];

type Connection<T> = {
  edges?: { node: T }[];
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};

const connectionOf = <T>(response: unknown, key: string): Connection<T> =>
  (response as Record<string, Connection<T>>)[key] ?? {};

// Walk every page so a workspace with more than one page of partners (or a partner
// with more than one page of children) is fully stamped instead of silently truncated.
const queryAllNodes = async <T>(
  runPage: (after: string | null) => Promise<Connection<T>>,
): Promise<T[]> => {
  const all: T[] = [];
  let after: string | null = null;
  for (;;) {
    const page = await runPage(after);
    for (const edge of page.edges ?? []) all.push(edge.node);
    const nextCursor = page.pageInfo?.hasNextPage ? page.pageInfo.endCursor : null;
    if (!nextCursor) break;
    after = nextCursor;
  }
  return all;
};

export async function backfillPartnerUserOnChildren(
  client: CoreApiClient,
): Promise<number> {
  const partners = await queryAllNodes<{ id: string; partnerUserId: string | null }>(
    (after) =>
      client
        .query({
          partners: {
            __args: { first: PAGE_SIZE, ...(after ? { after } : {}) },
            edges: { node: { id: true, partnerUserId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        })
        .then((res) => connectionOf(res, 'partners')),
  );

  let stamped = 0;

  for (const partner of partners) {
    if (!partner.partnerUserId) {
      continue;
    }

    for (const { childObject, listKey } of CHILD_QUERIES) {
      const children = await queryAllNodes<{ id: string; partnerUserId: string | null }>(
        (after) =>
          client
            .query({
              [listKey]: {
                __args: {
                  filter: { partnerId: { eq: partner.id } },
                  first: PAGE_SIZE,
                  ...(after ? { after } : {}),
                },
                edges: { node: { id: true, partnerUserId: true } },
                pageInfo: { hasNextPage: true, endCursor: true },
              },
            })
            .then((res) => connectionOf(res, listKey)),
      );

      for (const child of children) {
        if (child.partnerUserId === partner.partnerUserId) {
          continue;
        }

        await stampPartnerUserFromPartner(client, partner.id, childObject, child.id);
        stamped++;
      }
    }
  }

  return stamped;
}
