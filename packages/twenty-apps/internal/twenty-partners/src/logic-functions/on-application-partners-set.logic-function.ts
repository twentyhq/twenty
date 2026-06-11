import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_APPLICATION_PARTNERS_SET_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { renameApplicationIfNeeded } from 'src/logic-functions/shared/auto-name-records';

// Covers the case where an Application is created with both its brief and
// partner already set. Creation with relations linked afterwards is handled by
// on-application-partners-updated.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Application>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  try {
    return { renamed: await renameApplicationIfNeeded(after) };
  } catch {
    return { renamed: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_APPLICATION_PARTNERS_SET_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-application-partners-set',
  description: 'Auto-names an Application as "Application {Partner} - {Opportunity}" when created with both a brief and partner and no name.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'application.created',
  },
});
