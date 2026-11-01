import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  recomputeBookingTrainingActivity,
  type TrainingActivityEvent,
} from 'src/logic-functions/utils/training-activity';

export const handler = async (event: TrainingActivityEvent): Promise<void> => {
  await recomputeBookingTrainingActivity(new CoreApiClient(), event);
};

export default defineLogicFunction({
  universalIdentifier: '7b46e7c8-3703-4264-b6bb-92d53f1e7dbd',
  name: 'studio-booking-training-activity',
  description: 'Recompute client training activity after studioBooking changes',
  timeoutSeconds: 300,
  databaseEventTriggerSettings: { eventName: 'studioBooking.*' },
  handler,
});
