import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CONVERGE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/converge-diverged-call-recordings-logic-function-universal-identifier';
import { CONVERGE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/converge-diverged-call-recordings-cron-pattern';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';

type StepFailure = { error: string };

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

const buildStepFailure = (stepLabel: string, error: unknown): StepFailure => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[call-recorder] ${stepLabel} failed: ${errorMessage}`);
  }

  return { error: `${stepLabel} failed` };
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
