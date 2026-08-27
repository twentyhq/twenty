import type { CoreApiClient } from 'twenty-client-sdk/core';

import { collectAll } from 'src/modules/shared/utils/paginate.util';
import { listApplicationsByOpportunity } from 'src/modules/opportunity/matching/graphql/queries/list-applications-by-opportunity';
import { updateApplicationState } from 'src/modules/opportunity/matching/graphql/mutations/update-application-state';

// WON/DECLINED mirror of Opportunity.partner: on assign, winner -> WON and every other
// contender -> DECLINED (a loss); on unassign, only WON re-opens to APPLIED. Runs under the
// app identity, bypassing partner locks.
//
// Two states stay out of the mirror. BACKUP is a standing shortlist set before the
// introduction, so it survives the decision and its reversal. DECLINED is terminal because
// an admin can also set it by hand — reopening it here would undo that call.
export async function syncApplicationOutcomes(
  client: CoreApiClient,
  params: { opportunityId: string; newPartnerId: string | null },
): Promise<Record<string, unknown>> {
  const { opportunityId, newPartnerId } = params;

  const applications = await collectAll(async (after) => {
    const page = await listApplicationsByOpportunity(
      client,
      opportunityId,
      after,
    );
    return page.applications;
  });

  const setState = (id: string, state: string) =>
    updateApplicationState(client, id, state);

  if (newPartnerId) {
    for (const node of applications) {
      const isWinner = node.partnerId === newPartnerId;
      if (!isWinner && node.state === 'BACKUP') continue;
      const target = isWinner ? 'WON' : 'DECLINED';
      if (node.state !== target) await setState(node.id, target);
    }
    const winner = applications.find((node) => node.partnerId === newPartnerId);
    return { won: winner?.id ?? null };
  }

  for (const node of applications) {
    if (node.state === 'WON') await setState(node.id, 'APPLIED');
  }
  return { won: null, cleared: true };
}
