import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-diverged-call-recordings-logic-function-universal-identifier';
import { DIVERGED_CALL_RECORDING_CONVERGENCE_CRON_PATTERN } from 'src/logic-functions/constants/diverged-call-recording-convergence-cron-pattern';
import { convergeDivergedCallRecordings } from 'src/logic-functions/flows/converge-diverged-call-recordings.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';

export const reconcileDivergedCallRecordingsHandler =
  async (): Promise<ConvergeDivergedCallRecordingsResult> => {
    const client = new CoreApiClient();

    return convergeDivergedCallRecordings({ client, now: new Date() });
  };

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_DIVERGED_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-diverged-call-recordings',
  description:
    'Low-frequency safety net that pulls Recall bot state for call recordings whose webhooks were lost. Batches the pull via the bot list endpoint and falls back to per-id fetches only for bots outside the listed window.',
  timeoutSeconds: 250,
  handler: reconcileDivergedCallRecordingsHandler,
  cronTriggerSettings: {
    pattern: DIVERGED_CALL_RECORDING_CONVERGENCE_CRON_PATTERN,
  },
});
