import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_APPLICATION_PARTNERS_UPDATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { renameApplicationIfNeeded } from 'src/logic-functions/shared/auto-name-records';

// Covers the common flow: an Application is created blank (name '') and its
// brief / partner are linked afterwards, firing application.updated. Scoped via
// updatedFields so it only runs when one of those relations changes.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Application>>,
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
  universalIdentifier: ON_APPLICATION_PARTNERS_UPDATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-application-partners-updated',
  description: 'Auto-names a still-unnamed Application as "Application {Partner} - {Opportunity}" when its brief and partner are linked after creation.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'application.updated',
    updatedFields: ['brief', 'briefId', 'partner', 'partnerId'],
  },
});
