import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const ON_OPP_PARTNER_WON_FN_ID = '683f407e-e7a0-435d-a380-e51e536770f8';

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
  const result = await client.query({
    applications: {
      __args: { filter: { opportunityId: { eq: opportunityId } }, first: 200 },
      edges: { node: { id: true, partnerId: true, state: true } },
    },
  });
  const applications = result.applications?.edges ?? [];

  const setState = async (id: string, state: string) => {
    await client.mutation({
      updateApplication: { __args: { id, data: { state } }, id: true },
    });
  };

  if (newPartnerId) {
    // Winner -> WON; every other active (non-DECLINED) application -> BACKUP.
    for (const edge of applications) {
      const node = edge?.node;
      if (!node || node.state === 'DECLINED') continue;
      const target = node.partnerId === newPartnerId ? 'WON' : 'BACKUP';
      if (node.state !== target) await setState(node.id, target);
    }
    const winner = applications.find(
      (edge) => edge?.node?.partnerId === newPartnerId,
    )?.node;
    return { won: winner?.id ?? null };
  }

  // Unassigned: WON and BACKUP applications re-open to APPLIED. DECLINED untouched.
  for (const edge of applications) {
    const node = edge?.node;
    if (!node) continue;
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
