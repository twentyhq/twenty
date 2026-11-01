import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import {
  recomputeSessionTrainingActivity,
  type TrainingActivityEvent,
} from 'src/logic-functions/utils/training-activity';

export const handler = async (event: TrainingActivityEvent): Promise<void> => {
  await recomputeSessionTrainingActivity(new CoreApiClient(), event);
};

export default defineLogicFunction({
  universalIdentifier: '05cd09e6-32e1-411a-b2c1-31bad84940e7',
  name: 'studio-session-training-activity',
  description: 'Recompute client training activity after classSession changes',
  timeoutSeconds: 300,
  databaseEventTriggerSettings: { eventName: 'classSession.*' },
  handler,
});
