import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const ON_OPP_PARTNER_WON_FN_ID = '683f407e-e7a0-435d-a380-e51e536770f8';

const APPLICATIONS_PAGE_SIZE = 200;

// Every application on the brief, paginated fully — a single capped page would strand overflow
// applications in a stale WON/BACKUP/APPLIED state out of sync with Opportunity.partner.
async function collectApplications(client: CoreApiClient, opportunityId: string) {
  const query = (after?: string) =>
    client.query({
      applications: {
        __args: {
          filter: { opportunityId: { eq: opportunityId } },
          first: APPLICATIONS_PAGE_SIZE,
          ...(after ? { after } : {}),
        },
        edges: { node: { id: true, partnerId: true, state: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });
  type ApplicationNode = NonNullable<
    NonNullable<
      Awaited<ReturnType<typeof query>>['applications']
    >['edges'][number]['node']
  >;
  const applications: ApplicationNode[] = [];
  let after: string | undefined;
  for (;;) {
    const page = await query(after);
    for (const edge of page.applications?.edges ?? []) {
      if (edge?.node) applications.push(edge.node);
    }
    if (!page.applications?.pageInfo?.hasNextPage) break;
    after = page.applications.pageInfo.endCursor ?? undefined;
  }
  return applications;
}

// WON/BACKUP mirror of Opportunity.partner: on assign, winner -> WON and other active apps ->
// BACKUP; on unassign, WON/BACKUP -> APPLIED. DECLINED is never touched. Runs under the app
// identity, bypassing partner locks.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Opportunity>>,
): Promise<Record<string, unknown>> => {
  const { after, updatedFields } = payload.properties;
  if (!updatedFields?.includes('partnerId')) return {};
  const opportunityId = after?.id;
  if (!opportunityId) return {};
  const newPartnerId = after?.partnerId ?? null;

  const client = new CoreApiClient();
  const applications = await collectApplications(client, opportunityId);

  const setState = async (id: string, state: string) => {
    await client.mutation({
      updateApplication: { __args: { id, data: { state } }, id: true },
    });
  };

  if (newPartnerId) {
    // Winner -> WON; every other active (non-DECLINED) application -> BACKUP.
    for (const node of applications) {
      if (node.state === 'DECLINED') continue;
      const target = node.partnerId === newPartnerId ? 'WON' : 'BACKUP';
      if (node.state !== target) await setState(node.id, target);
    }
    const winner = applications.find(
      (node) => node.partnerId === newPartnerId,
    );
    return { won: winner?.id ?? null };
  }

  // Unassigned: WON and BACKUP applications re-open to APPLIED. DECLINED untouched.
  for (const node of applications) {
    if (node.state === 'WON' || node.state === 'BACKUP') {
      await setState(node.id, 'APPLIED');
    }
  }
  return { won: null, cleared: true };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPP_PARTNER_WON_FN_ID,
  name: 'on-opportunity-partner-won',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'opportunity.updated' },
});
