import { defineLogicFunction } from 'twenty-sdk/define';

import { SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH } from 'src/constants/sync-member-recording-preference-route-path';
import {
  SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  SYNC_MEMBER_RECORDING_PREFERENCE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { enqueueLogicFunctionJobs } from 'src/logic-functions/data/enqueue-logic-function-jobs.util';

export const syncMemberRecordingPreferenceHandler = async (): Promise<{
  outcome: 'sweep-enqueued';
}> => {
  await enqueueLogicFunctionJobs({
    logicFunctionUniversalIdentifier:
      SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
    payloads: [{}],
  });

  return { outcome: 'sweep-enqueued' };
};

export default defineLogicFunction({
  universalIdentifier:
    SYNC_MEMBER_RECORDING_PREFERENCE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'sync-member-recording-preference',
  description:
    'Sweeps upcoming meetings after a member changed which of their meetings are recorded.',
  timeoutSeconds: 30,
  handler: syncMemberRecordingPreferenceHandler,
  httpRouteTriggerSettings: {
    path: SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
