import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { resolveCandidacy } from 'src/modules/application/services/resolve-candidacy.service';

const ON_APPLICATION_CREATED_FN_ID = '0e055a1c-b8b3-4572-89f3-e76e37bc3f9e';

export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Application>>,
): Promise<Record<string, unknown>> =>
  resolveCandidacy(new CoreApiClient(), payload.properties.after);

export default defineLogicFunction({
  universalIdentifier: ON_APPLICATION_CREATED_FN_ID,
  name: 'on-application-created',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'application.created' },
});
