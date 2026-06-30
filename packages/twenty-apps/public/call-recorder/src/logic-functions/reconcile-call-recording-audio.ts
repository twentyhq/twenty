import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_CALL_RECORDING_AUDIO_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-call-recording-audio-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  reconcileCallRecordingAudioArtifacts,
  type ReconcileCallRecordingAudioArtifactsResult,
} from 'src/logic-functions/flows/reconcile-call-recording-audio-artifacts.util';

export const reconcileCallRecordingAudioHandler =
  async (): Promise<ReconcileCallRecordingAudioArtifactsResult> => {
    const client = new CoreApiClient();

    return reconcileCallRecordingAudioArtifacts({ client });
  };

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_CALL_RECORDING_AUDIO_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recording-audio',
  description: 'Backfills missing call recording audio artifacts.',
  timeoutSeconds: 250,
  handler: reconcileCallRecordingAudioHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
