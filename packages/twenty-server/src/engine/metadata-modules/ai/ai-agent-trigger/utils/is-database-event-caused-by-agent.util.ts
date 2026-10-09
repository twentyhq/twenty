import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';
import type { ActorMetadata } from 'twenty-shared/types';

import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

type RecordWithActors = {
  createdBy?: ActorMetadata | null;
  updatedBy?: ActorMetadata | null;
};

// Deletions keep the last updater, so only creations and updates can be attributed to the agent
export const isDatabaseEventCausedByAgent = ({
  event,
  eventName,
  agentId,
}: {
  event: ObjectRecordEvent;
  eventName: string;
  agentId: string;
}): boolean => {
  const { action } = parseEventNameOrThrow(eventName);
  const { after } = event.properties as { after?: RecordWithActors };

  if (!isDefined(after)) {
    return false;
  }

  switch (action) {
    case 'created':
      return after.createdBy?.context?.agentId === agentId;
    case 'updated':
    case 'upserted':
      return after.updatedBy?.context?.agentId === agentId;
    default:
      return false;
  }
};
