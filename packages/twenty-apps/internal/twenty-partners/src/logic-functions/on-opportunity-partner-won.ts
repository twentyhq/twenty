import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const ON_OPP_PARTNER_WON_FN_ID = '683f407e-e7a0-435d-a380-e51e536770f8';

// WON is the locked mirror of Opportunity.partner: exactly one WON Application per opportunity,
// always the assigned partner's. Reverts a demoted/unassigned winner to INTRODUCED (it was at
// least introduced to have been picked). Runs under the app identity, bypassing partner locks.
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

  // Revert any current WON that is no longer the assigned partner.
  for (const edge of applications) {
    const node = edge?.node;
    if (node?.state === 'WON' && node.partnerId !== newPartnerId) {
      await client.mutation({
        updateApplication: {
          __args: { id: node.id, data: { state: 'INTRODUCED' } },
          id: true,
        },
      });
    }
  }

  // Promote the assigned partner's application (if one exists) to WON.
  if (newPartnerId) {
    const winner = applications.find(
      (edge) => edge?.node?.partnerId === newPartnerId,
    )?.node;
    if (winner && winner.state !== 'WON') {
      await client.mutation({
        updateApplication: {
          __args: { id: winner.id, data: { state: 'WON' } },
          id: true,
        },
      });
    }
    return { won: winner?.id ?? null };
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
