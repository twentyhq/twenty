import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-diverged-call-recordings-logic-function-universal-identifier';
import { RECONCILE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/reconcile-diverged-call-recordings-cron-pattern';
import { reconcileDivergedCallRecordings } from 'src/logic-functions/flows/reconcile-diverged-call-recordings.util';
import { type ReconcileDivergedCallRecordingsResult } from 'src/logic-functions/flows/reconcile-diverged-call-recordings-result.type';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

export const reconcileDivergedCallRecordingsHandler = async (): Promise<
  ReconcileDivergedCallRecordingsResult | StepFailure
> => {
  try {
    return await reconcileDivergedCallRecordings({
      client: new CoreApiClient(),
      now: new Date(),
    });
  } catch (error) {
    return buildStepFailure('diverged call recording reconciliation', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-diverged-call-recordings',
  description:
    'Batched low-frequency safety net that reconciles CallRecordings from Recall bot, recording, and transcript state when webhook delivery was missed.',
  timeoutSeconds: 250,
  handler: reconcileDivergedCallRecordingsHandler,
  cronTriggerSettings: {
    pattern: RECONCILE_DIVERGED_CALL_RECORDINGS_CRON_PATTERN,
  },
});
