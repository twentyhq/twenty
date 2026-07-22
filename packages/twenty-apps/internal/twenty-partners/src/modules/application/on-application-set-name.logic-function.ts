import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { findApplicationWithRelations } from 'src/modules/application/graphql/queries/find-application-with-relations';
import { updateApplication } from 'src/modules/application/graphql/mutations/update-application';

const ON_APPLICATION_SET_NAME_FN_ID = '8f123b54-a7c5-42d3-8049-a240930257a7';

// Re-label an Application "<partner> · <opportunity>" whenever either relation changes.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Application>>,
): Promise<Record<string, unknown>> => {
  const { after, updatedFields } = payload.properties;
  const touchedRelation = updatedFields?.includes('partnerId') || updatedFields?.includes('opportunityId');
  if (!touchedRelation) return {};
  const id = after?.id;
  if (!id) return {};
  const client = new CoreApiClient();
  const result = await findApplicationWithRelations(client, id);

  const partnerName = result.application?.partner?.name ?? 'Unassigned';
  const opportunityName = result.application?.opportunity?.name ?? 'No brief';
  const name = `${partnerName} · ${opportunityName}`;

  await updateApplication(client, id, { name });
  return { labelled: name };
};

export default defineLogicFunction({
  universalIdentifier: ON_APPLICATION_SET_NAME_FN_ID,
  name: 'on-application-set-name',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'application.updated' },
});
