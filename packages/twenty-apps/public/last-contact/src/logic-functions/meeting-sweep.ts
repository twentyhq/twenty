import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import {
  MEETING_SCHEDULE_HORIZON_MS,
  MEETING_SWEEP_LOOKBACK_MS,
} from 'src/constants/meeting-schedule';
import { MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyStartedMeetings } from 'src/utils/apply-started-meetings';
import { collectCalendarEventStarts } from 'src/utils/collect-calendar-event-starts';
import { scheduleMeetingSlotJobs } from 'src/utils/schedule-meeting-slot-jobs';

// Catches meetings whose slot job was never scheduled or did not run, and
// schedules meetings that came within the delayed job horizon.
const handler = async (): Promise<void> => {
  const client = new CoreApiClient();
  const now = new Date();

  const calendarEventStarts = await collectCalendarEventStarts(client, {
    from: new Date(now.getTime() - MEETING_SWEEP_LOOKBACK_MS),
    to: new Date(now.getTime() + MEETING_SCHEDULE_HORIZON_MS),
  });
  const nowIso = now.toISOString();

  await applyStartedMeetings(
    client,
    calendarEventStarts
      .filter(({ startsAt }) => startsAt <= nowIso)
      .map(({ id }) => id),
  );
  await scheduleMeetingSlotJobs(
    calendarEventStarts
      .filter(({ startsAt }) => startsAt > nowIso)
      .map(({ startsAt }) => startsAt),
  );
};

export default defineLogicFunction({
  universalIdentifier: MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'meeting-sweep',
  description:
    'Updates last-contact fields from meetings that started in the last day and schedules the meetings of the next two days.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler,
});
