import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { RECONCILE_CALL_RECORDING_VIDEO_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/reconcile-call-recording-video-logic-function-universal-identifier';
import { STALE_BOT_STATE_CRON_PATTERN } from 'src/logic-functions/constants/stale-bot-state-cron-pattern';
import {
  reconcileCallRecordingVideoArtifacts,
  type ReconcileCallRecordingVideoArtifactsResult,
} from 'src/logic-functions/flows/reconcile-call-recording-video-artifacts.util';

export const reconcileCallRecordingVideoHandler =
  async (): Promise<ReconcileCallRecordingVideoArtifactsResult> => {
    const client = new CoreApiClient();

    return reconcileCallRecordingVideoArtifacts({ client });
  };

export default defineLogicFunction({
  universalIdentifier:
    RECONCILE_CALL_RECORDING_VIDEO_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'reconcile-call-recording-video',
  description: 'Backfills missing call recording video artifacts.',
  timeoutSeconds: 250,
  handler: reconcileCallRecordingVideoHandler,
  cronTriggerSettings: {
    pattern: STALE_BOT_STATE_CRON_PATTERN,
  },
});
