import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CANCEL_BEYOND_HORIZON_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/cancel-beyond-horizon-call-recordings-logic-function-universal-identifier';
import { BEYOND_HORIZON_CALL_RECORDING_CANCELLATION_CRON_PATTERN } from 'src/logic-functions/constants/beyond-horizon-call-recording-cancellation-cron-pattern';
import {
  cancelBeyondHorizonCallRecordings,
  type CancelBeyondHorizonCallRecordingsResult,
} from 'src/logic-functions/flows/cancel-beyond-horizon-call-recordings.util';

export const cancelBeyondHorizonCallRecordingsHandler =
  async (): Promise<CancelBeyondHorizonCallRecordingsResult> => {
    const client = new CoreApiClient();

    return cancelBeyondHorizonCallRecordings({ client, now: new Date() });
  };

export default defineLogicFunction({
  universalIdentifier:
    CANCEL_BEYOND_HORIZON_CALL_RECORDINGS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'cancel-beyond-horizon-call-recordings',
  description:
    'Daily cleanup that cancels recording bots scheduled for meetings beyond the scheduling horizon, such as bots scheduled before the horizon shipped. The daily sweep re-creates a fresh bot when the meeting re-enters the horizon.',
  timeoutSeconds: 250,
  handler: cancelBeyondHorizonCallRecordingsHandler,
  cronTriggerSettings: {
    pattern: BEYOND_HORIZON_CALL_RECORDING_CANCELLATION_CRON_PATTERN,
  },
});
