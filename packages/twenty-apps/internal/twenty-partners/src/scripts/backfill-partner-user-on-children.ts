import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  stampPartnerUserFromPartner,
  type PartnerChildObject,
} from 'src/logic-functions/stamp-partner-user-on-child';

const CHILD_QUERIES: {
  childObject: PartnerChildObject;
  listKey: 'partnerLinks' | 'partnerServices' | 'partnerContents';
}[] = [
  { childObject: 'partnerLink', listKey: 'partnerLinks' },
  { childObject: 'partnerService', listKey: 'partnerServices' },
  { childObject: 'partnerContent', listKey: 'partnerContents' },
];

const nodes = (response: unknown, key: string): { id: string }[] => {
  const record = response as Record<string, { edges?: { node: { id: string } }[] }>;
  return (record[key]?.edges ?? []).map((edge) => edge.node);
};

export async function backfillPartnerUserOnChildren(
  client: CoreApiClient,
): Promise<number> {
  const partners = nodes(
    await client.query({
      partners: {
        __args: { first: 200 },
        edges: {
          node: {
            id: true,
            slug: true,
            partnerUserId: true,
          },
        },
      },
    }),
    'partners',
  ) as { id: string; slug: string; partnerUserId: string | null }[];

  let stamped = 0;

  for (const partner of partners) {
    if (!partner.partnerUserId) {
      continue;
    }

    for (const { childObject, listKey } of CHILD_QUERIES) {
      const children = nodes(
        await client.query({
          [listKey]: {
            __args: {
              filter: { partnerId: { eq: partner.id } },
              first: 200,
            },
            edges: {
              node: {
                id: true,
                partnerUserId: true,
              },
            },
          },
        }),
        listKey,
      ) as { id: string; partnerUserId: string | null }[];

      for (const child of children) {
        if (child.partnerUserId === partner.partnerUserId) {
          continue;
        }

        await stampPartnerUserFromPartner(
          client,
          partner.id,
          childObject,
          child.id,
        );
        stamped++;
      }
    }
  }

  return stamped;
}
