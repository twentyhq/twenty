import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import {
  enqueueJobs,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT } from 'src/logic-functions/constants/fireflies-backfill-batch-retry-limit.constant';

import {
  BACKFILL_CALENDAR_PARTICIPANTS_UNIVERSAL_IDENTIFIER,
  SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const backfillCalendarParticipantsHandler = async (): Promise<void> => {
  try {
    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        SYNC_CALL_RECORDING_CALENDAR_PARTICIPANT_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
      retryLimit: FIREFLIES_BACKFILL_BATCH_RETRY_LIMIT,
    });
  } catch (error) {
    throw new RetryableLogicFunctionError(
      `Calendar participant backfill kickoff failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export default definePostInstallLogicFunction({
  universalIdentifier: BACKFILL_CALENDAR_PARTICIPANTS_UNIVERSAL_IDENTIFIER,
  name: 'backfill-calendar-participants',
  description:
    'Backfills Fireflies participants for previously imported meetings.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: backfillCalendarParticipantsHandler,
});
