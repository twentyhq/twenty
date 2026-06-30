import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-call-recording-transcript-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  reconcileCallRecordingTranscriptArtifacts,
  type ReconcileCallRecordingTranscriptArtifactsResult,
} from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifacts.util';

export const reconcileCallRecordingTranscriptHandler =
  async (): Promise<ReconcileCallRecordingTranscriptArtifactsResult> => {
    const client = new CoreApiClient();

    return reconcileCallRecordingTranscriptArtifacts({
      client,
      now: new Date(),
    });
  };

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_CALL_RECORDING_TRANSCRIPT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recording-transcript',
  description: 'Backfills missing call recording transcripts.',
  timeoutSeconds: 120,
  handler: reconcileCallRecordingTranscriptHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
