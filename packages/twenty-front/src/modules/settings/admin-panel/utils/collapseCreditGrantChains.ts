import { isDefined } from 'twenty-shared/utils';

type CreditGrantChainLink = {
  id: string;
  sourceGrantId?: string | null;
};

export type CollapsedCreditGrant<TGrant extends CreditGrantChainLink> = {
  // The origin's id, stable across period settlements.
  id: string;
  // The row still holding the credits: its amount and status are current.
  current: TGrant;
  // The row the operator created, carrying their reason and date.
  origin: TGrant;
};

// Each period transition writes a grant's unspent part as a new row linked by sourceGrantId.
export const collapseCreditGrantChains = <TGrant extends CreditGrantChainLink>(
  creditGrants: TGrant[],
): CollapsedCreditGrant<TGrant>[] => {
  const grantById = new Map(creditGrants.map((grant) => [grant.id, grant]));

  const successorBySourceId = new Map<string, TGrant>();

  for (const grant of creditGrants) {
    const sourceGrantId = grant.sourceGrantId;

    if (isDefined(sourceGrantId) && grantById.has(sourceGrantId)) {
      successorBySourceId.set(sourceGrantId, grant);
    }
  }

  const collapsedIds = new Set<string>();

  const collapseFrom = (origin: TGrant): CollapsedCreditGrant<TGrant> => {
    const chainIds = new Set([origin.id]);
    let current = origin;
    let successor = successorBySourceId.get(origin.id);

    while (isDefined(successor) && !chainIds.has(successor.id)) {
      chainIds.add(successor.id);
      current = successor;
      successor = successorBySourceId.get(successor.id);
    }

    for (const chainId of chainIds) {
      collapsedIds.add(chainId);
    }

    return { id: origin.id, current, origin };
  };

  // A grant whose source is missing reads as an origin: a truncated chain beats a dropped row.
  const rows = creditGrants
    .filter(
      (grant) =>
        !isDefined(grant.sourceGrantId) || !grantById.has(grant.sourceGrantId),
    )
    .map(collapseFrom);

  if (collapsedIds.size === creditGrants.length) {
    return rows;
  }

  // Only reachable on a ledger cycle; untouched rows still show on their own.
  const orphanedRows = creditGrants
    .filter((grant) => !collapsedIds.has(grant.id))
    .map((grant) => ({ id: grant.id, current: grant, origin: grant }));

  return [...rows, ...orphanedRows];
};
