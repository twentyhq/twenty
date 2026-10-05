import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyStartedMeetings } from 'src/utils/apply-started-meetings';
import { collectCalendarEventStarts } from 'src/utils/collect-calendar-event-starts';
import { type MeetingSlotPayload } from 'src/utils/schedule-meeting-slot-jobs';

// Meetings are re-read rather than carried in the payload: one moved or
// canceled after scheduling no longer matches the slot.
const handler = async ({
  slotStart,
  slotEnd,
}: MeetingSlotPayload): Promise<void> => {
  const client = new CoreApiClient();

  const calendarEventStarts = await collectCalendarEventStarts(client, {
    from: new Date(slotStart),
    to: new Date(slotEnd),
  });

  await applyStartedMeetings(
    client,
    calendarEventStarts.map(({ id }) => id),
  );
};

export default defineLogicFunction({
  universalIdentifier: MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'on-meeting-slot-reached',
  description:
    'Updates last-contact fields for participants of the meetings that started in a time slot. Enqueued with a delay when a meeting is scheduled.',
  timeoutSeconds: BATCH_HANDLER_TIMEOUT_SECONDS,
  handler,
});
