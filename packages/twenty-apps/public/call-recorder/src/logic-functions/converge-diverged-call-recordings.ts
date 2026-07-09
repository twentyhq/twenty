import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CONVERGE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/converge-diverged-call-recordings-logic-function-universal-identifier';
import { CONVERGE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/converge-diverged-call-recordings-cron-pattern';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

export const convergeDivergedCallRecordingsHandler = async (): Promise<
  ConvergeDivergedCallRecordingsResult | StepFailure
> => {
  try {
    return await convergeDivergedCallRecordings({
      client: new CoreApiClient(),
      now: new Date(),
    });
  } catch (error) {
    return buildStepFailure('call recording status convergence', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    CONVERGE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'converge-diverged-call-recordings',
  description:
    'Batched low-frequency safety net that converges CallRecordings from Recall bot, recording, and transcript state when webhook delivery was missed.',
  timeoutSeconds: 250,
  handler: convergeDivergedCallRecordingsHandler,
  cronTriggerSettings: {
    pattern: CONVERGE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN,
  },
});
