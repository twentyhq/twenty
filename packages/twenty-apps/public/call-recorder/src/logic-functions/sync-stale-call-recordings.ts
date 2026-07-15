import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { SYNC_STALE_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/sync-stale-call-recordings-logic-function-universal-identifier';
import { SYNC_STALE_CALL_RECORDINGS_CRON_PATTERN } from 'src/logic-functions/constants/sync-stale-call-recordings-cron-pattern';
import { syncStaleCallRecordings } from 'src/logic-functions/flows/sync-stale-call-recordings.util';
import { type SyncStaleCallRecordingsResult } from 'src/logic-functions/flows/sync-stale-call-recordings-result.type';
import {
  buildStepFailure,
  type StepFailure,
} from 'src/logic-functions/utils/build-step-failure.util';

export const syncStaleCallRecordingsHandler = async (): Promise<
  SyncStaleCallRecordingsResult | StepFailure
> => {
  try {
    return await syncStaleCallRecordings({
      client: new CoreApiClient(),
      now: new Date(),
    });
  } catch (error) {
    return buildStepFailure('stale call recording sync', error);
  }
};

export default defineLogicFunction({
  universalIdentifier:
    SYNC_STALE_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-stale-call-recordings',
  description:
    'Scheduled safety net that syncs stale CallRecordings from Recall bot state when webhook-driven imports were missed or interrupted.',
  timeoutSeconds: 250,
  handler: syncStaleCallRecordingsHandler,
  cronTriggerSettings: {
    pattern: SYNC_STALE_CALL_RECORDINGS_CRON_PATTERN,
  },
});
