import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

import { CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  clearStaleCallRecorderPreferences,
  type ClearStaleCallRecorderPreferencesResult,
} from 'src/logic-functions/flows/clear-stale-call-recorder-preferences.util';
import { buildRetryableStepFailure } from 'src/logic-functions/utils/build-step-failure.util';

export const clearStaleCallRecorderPreferencesHandler =
  async (): Promise<ClearStaleCallRecorderPreferencesResult> => {
    try {
      return await clearStaleCallRecorderPreferences({
        client: new CoreApiClient(),
        now: new Date(),
      });
    } catch (error) {
      throw buildRetryableStepFailure(
        'stale call recorder preference cleanup',
        error,
      );
    }
  };

export default defineLogicFunction({
  universalIdentifier:
    CLEAR_STALE_CALL_RECORDER_PREFERENCES_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'clear-stale-call-recorder-preferences',
  description:
    'Clears the default Recording Bot preference on past calendar events the recorder never attempted, so only meetings that were or will be recorded read as on.',
  timeoutSeconds: 900,
  handler: clearStaleCallRecorderPreferencesHandler,
});
