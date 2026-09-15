import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';
import { createTimelineActivity } from 'twenty-sdk/logic-function';

import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/post-card.object';

const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<{ id: string }>>,
) => {
  await createTimelineActivity({
    timelineActivityTypeUniversalIdentifier:
      'f4fa646c-6e11-4d8f-a6be-c3b7a2fc7500',
    targetObjectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
    targetRecordId: payload.properties.after.id,
  });

  return { processed: true };
};

export default defineLogicFunction({
  universalIdentifier: 'a1b2c3d4-db01-4a7b-8c9d-0e1f2a3b4c5d',
  name: 'on-post-card-created',
  description: 'Triggered when a new post card is created',
  timeoutSeconds: 5,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'postCard.created',
  },
});
