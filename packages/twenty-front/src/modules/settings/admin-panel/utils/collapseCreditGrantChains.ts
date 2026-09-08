import { isDefined } from 'twenty-shared/utils';

type CreditGrantChainLink = {
  id: string;
  sourceGrantId?: string | null;
};

export type CollapsedCreditGrant<TGrant extends CreditGrantChainLink> = {
  // The origin's id, which stays the same as the grant is settled from one
  // period to the next.
  id: string;
  // The row still holding the credits: its amount is what is left of the grant
  // and its status is the one that matters.
  current: TGrant;
  // The row the operator actually created, which carries the reason they typed
  // and the date they handed the credits out.
  origin: TGrant;
};

// Every period transition settles a grant and writes its unspent part as a new
// row, so one handout of credits shows up once per period it survived. The rows
// are linked by sourceGrantId, so the chain can be shown as the single grant it
// represents.
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

  // A grant whose source is not in the list still reads as an origin, because
  // truncating the chain is better than dropping the row.
  const rows = creditGrants
    .filter(
      (grant) =>
        !isDefined(grant.sourceGrantId) || !grantById.has(grant.sourceGrantId),
    )
    .map(collapseFrom);

  if (collapsedIds.size === creditGrants.length) {
    return rows;
  }

  // Only reachable if the ledger ever held a cycle, which it should not. Rows
  // no walk touched are still shown on their own rather than disappearing.
  const orphanedRows = creditGrants
    .filter((grant) => !collapsedIds.has(grant.id))
    .map((grant) => ({ id: grant.id, current: grant, origin: grant }));

  return [...rows, ...orphanedRows];
};
