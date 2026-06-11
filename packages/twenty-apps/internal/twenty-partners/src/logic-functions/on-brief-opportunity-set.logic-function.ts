import { type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { ON_BRIEF_OPPORTUNITY_SET_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { renameBriefIfNeeded } from 'src/logic-functions/shared/auto-name-records';

// Covers the case where a Brief is created with its opportunity already set
// (e.g. from an Opportunity's Briefs panel). The table "New Brief" flow creates
// the record blank and links the opportunity afterwards — that is handled by
// on-brief-opportunity-updated.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Brief>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  if (!after?.id) return {};

  try {
    return { renamed: await renameBriefIfNeeded(after) };
  } catch {
    return { renamed: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_BRIEF_OPPORTUNITY_SET_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-brief-opportunity-set',
  description: 'Auto-names a Brief as "Brief {Opportunity}" when created with an opportunity and no name.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'brief.created',
  },
});
