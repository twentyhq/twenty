import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

const ON_APPLICATION_SET_NAME_FN_ID = '8f123b54-a7c5-42d3-8049-a240930257a7';

// Re-label an Application "<partner> · <opportunity>" whenever either relation changes.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Application>>,
): Promise<Record<string, unknown>> => {
  const { after, updatedFields } = payload.properties;
  const touchedRelation =
    updatedFields?.includes('partnerId') ||
    updatedFields?.includes('opportunityId');
  if (!touchedRelation) return {};
  const id = after?.id;
  if (!id) return {};

  const client = new CoreApiClient();
  const result = await client.query({
    application: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partner: { name: true },
      opportunity: { name: true },
    },
  });

  const partnerName = result.application?.partner?.name ?? 'Unassigned';
  const opportunityName = result.application?.opportunity?.name ?? 'No brief';
  const name = `${partnerName} · ${opportunityName}`;

  await client.mutation({
    updateApplication: { __args: { id, data: { name } }, id: true },
  });
  return { labelled: name };
};

export default defineLogicFunction({
  universalIdentifier: ON_APPLICATION_SET_NAME_FN_ID,
  name: 'on-application-set-name',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'application.updated' },
});
