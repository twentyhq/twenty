import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/stale-bot-state-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

const reconcileStaleBotStateHandler = async (): Promise<object> => {
  const now = new Date();
  const client = new CoreApiClient();

  const statusConvergenceResult = await convergeDivergedCallRecordingsSafely(
    client,
    now,
  );

  return { statusConvergenceResult };
};

const convergeDivergedCallRecordingsSafely = async (
  client: CoreApiClient,
  now: Date,
): Promise<ConvergeDivergedCallRecordingsResult | StepFailure> => {
  try {
    return await convergeDivergedCallRecordings({ client, now });
  } catch (error) {
    return buildStepFailure('call recording status convergence', error);
  }
};

export default defineLogicFunction({
  universalIdentifier: STALE_BOT_STATE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-stale-bot-state',
  description:
    'Converges stale Call Recording status and artifacts with Recall when webhook delivery is missed.',
  timeoutSeconds: 250,
  handler: reconcileStaleBotStateHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
