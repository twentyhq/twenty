import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';
import { enqueueFathomJobsOrThrow } from 'src/logic-functions/utils/enqueue-fathom-jobs-or-throw.util';

import {
  BACKFILL_CALENDAR_PARTICIPANTS_UNIVERSAL_IDENTIFIER,
  BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export const backfillCalendarParticipantsHandler = async (): Promise<void> => {
  try {
    await enqueueFathomJobsOrThrow({
      logicFunctionUniversalIdentifier:
        BACKFILL_CALENDAR_PARTICIPANTS_BATCH_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
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
    'Backfills Fathom participants for previously imported meetings.',
  timeoutSeconds: 30,
  shouldRunOnVersionUpgrade: true,
  handler: backfillCalendarParticipantsHandler,
});
