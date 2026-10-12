import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { scheduleUpcomingPersonMeetings } from 'src/utils/schedule-meetings';

const handler = async (): Promise<void> => {
  await scheduleUpcomingPersonMeetings(new CoreApiClient());
};

export default defineLogicFunction({
  universalIdentifier:
    MEETING_HORIZON_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-meeting-horizon-reached',
  description:
    'Schedules the meetings that came within reach of a delayed job, and the next run while meetings remain further out. Enqueued only when such meetings exist.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler,
});
