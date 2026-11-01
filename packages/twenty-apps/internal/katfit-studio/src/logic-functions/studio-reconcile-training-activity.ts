import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { recomputeTrainingActivity } from 'src/logic-functions/utils/training-activity';

export const handler = async (): Promise<void> => {
  await recomputeTrainingActivity(new CoreApiClient());
};

export default defineLogicFunction({
  universalIdentifier: '6cc14512-c5ea-4894-8996-c6fc5653663b',
  name: 'studio-reconcile-training-activity',
  description:
    'Daily reconciliation of client training activity, including existing clients',
  timeoutSeconds: 300,
  cronTriggerSettings: { pattern: '0 2 * * *' },
  handler,
});
