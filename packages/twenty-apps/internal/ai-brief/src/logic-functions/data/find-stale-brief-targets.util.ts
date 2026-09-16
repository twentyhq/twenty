import { isNull, isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type BriefTargetType } from 'src/constants/target-types';
import { BRIEF_STALE_AFTER_DAYS } from 'src/logic-functions/constants/brief-sweep.constants';

export type StaleBriefTarget = {
  targetType: BriefTargetType;
  recordId: string;
  displayName: string;
};

type CompanyNode = { id: string; name: string | null };
type CompanyQueryResult = {
  companies?: { edges?: { node: CompanyNode | null }[] | null } | null;
};

type PersonName = { firstName: string | null; lastName: string | null } | null;
type PersonNode = { id: string; name: PersonName };
type PersonQueryResult = {
  people?: { edges?: { node: PersonNode | null }[] | null } | null;
};

const computeStaleBeforeIso = (now: Date): string => {
  const staleBefore = new Date(
    now.getTime() - BRIEF_STALE_AFTER_DAYS * 24 * 60 * 60 * 1000,
  );

  return staleBefore.toISOString();
};

const staleBriefFilter = (staleBeforeIso: string) => ({
  or: [
    { aiBriefUpdatedAt: { is: 'NULL' } },
    { aiBriefUpdatedAt: { lte: staleBeforeIso } },
  ],
});

// Records whose brief has never been generated or whose last generation is
// older than the staleness window. Ordering by updatedAt desc surfaces the
// records the team actually touches first.
export const findStaleBriefTargets = async ({
  client,
  targetType,
  now,
  limit,
}: {
  client: CoreApiClient;
  targetType: BriefTargetType;
  now: Date;
  limit: number;
}): Promise<StaleBriefTarget[]> => {
  const staleBeforeIso = computeStaleBeforeIso(now);

  if (targetType === 'company') {
    const queryResult = (await client.query({
      companies: {
        __args: {
          filter: staleBriefFilter(staleBeforeIso),
          orderBy: [{ updatedAt: 'DescNullsLast' }],
          first: limit,
        },
        edges: {
          node: {
            id: true,
            name: true,
          },
        },
      },
    })) as CompanyQueryResult;

    return (queryResult.companies?.edges ?? [])
      .map((edge) => edge?.node)
      .filter((node): node is CompanyNode => Boolean(node?.id))
      .map((node) => ({
        targetType,
        recordId: node.id,
        displayName: node.name ?? node.id,
      }));
  }

  const queryResult = (await client.query({
    people: {
      __args: {
        filter: staleBriefFilter(staleBeforeIso),
        orderBy: [{ updatedAt: 'DescNullsLast' }],
        first: limit,
      },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
        },
      },
    },
  })) as PersonQueryResult;

  return (queryResult.people?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((node): node is PersonNode => Boolean(node?.id))
    .map((node) => ({
      targetType,
      recordId: node.id,
      displayName:
        [node.name?.firstName, node.name?.lastName]
          .filter((part) => !isUndefined(part) && !isNull(part) && part !== '')
          .join(' ') || node.id,
    }));
};
