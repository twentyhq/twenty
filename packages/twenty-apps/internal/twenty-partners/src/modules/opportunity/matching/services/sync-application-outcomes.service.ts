import type { CoreApiClient } from 'twenty-client-sdk/core';

import { collectAll } from 'src/modules/shared/utils/paginate.util';
import { listApplicationsByOpportunity } from 'src/modules/opportunity/matching/graphql/queries/list-applications-by-opportunity';
import { updateApplicationState } from 'src/modules/opportunity/matching/graphql/mutations/update-application-state';

// WON/DECLINED mirror of Opportunity.partner: on assign, winner -> WON and every other
// application -> DECLINED (a loss); on unassign, WON/DECLINED -> APPLIED. BACKUP is set before
// the introduction and is never touched here. Runs under the app identity, bypassing partner
// locks.
export async function syncApplicationOutcomes(
  client: CoreApiClient,
  params: { opportunityId: string; newPartnerId: string | null },
): Promise<Record<string, unknown>> {
  const { opportunityId, newPartnerId } = params;

  const applications = await collectAll(async (after) => {
    const page = await listApplicationsByOpportunity(client, opportunityId, after);
    return page.applications;
  });

  const setState = (id: string, state: string) => updateApplicationState(client, id, state);

  if (newPartnerId) {
    // Winner -> WON; every other application -> DECLINED (a loss).
    for (const node of applications) {
      const target = node.partnerId === newPartnerId ? 'WON' : 'DECLINED';
      if (node.state !== target) await setState(node.id, target);
    }
    const winner = applications.find((node) => node.partnerId === newPartnerId);
    return { won: winner?.id ?? null };
  }

  // Unassigned: WON and DECLINED re-open to APPLIED. BACKUP predates the introduction and
  // was never in the running for this decision, so it stays untouched.
  for (const node of applications) {
    if (node.state === 'WON' || node.state === 'DECLINED') {
      await setState(node.id, 'APPLIED');
    }
  }
  return { won: null, cleared: true };
}
