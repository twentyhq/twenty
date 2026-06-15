import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { ON_BRIEF_OPPORTUNITY_UPDATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { renameBriefIfNeeded } from 'src/logic-functions/shared/auto-name-records';

// Covers the common flow: a Brief is created blank from the index table (no
// opportunity yet, name '') and the opportunity is linked afterwards, which
// fires brief.updated. Scoped via updatedFields so it only runs when the
// opportunity relation actually changes — not on every brief edit.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Brief>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  try {
    return { renamed: await renameBriefIfNeeded(after) };
  } catch (e) {
    console.error('on-brief-opportunity-updated failed', e);
    return { renamed: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_BRIEF_OPPORTUNITY_UPDATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-brief-opportunity-updated',
  description: 'Auto-names a still-unnamed Brief as "Brief {Opportunity}" when an opportunity is linked after creation.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'brief.updated',
    updatedFields: ['opportunity', 'opportunityId'],
  },
});
