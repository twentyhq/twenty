import { defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { BATCH_HANDLER_TIMEOUT_SECONDS } from 'src/constants/batch-handler-timeout-seconds';
import { MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyMeetingInteractions } from 'src/utils/apply-meeting-interactions';
import { collectPersonMeetingParticipants } from 'src/utils/collect-person-meeting-participants';
import { type MeetingSlotPayload } from 'src/utils/schedule-meetings';

// Meetings are re-read rather than carried in the payload: one moved or
// canceled after scheduling no longer matches the slot.
const handler = async ({
  slotStart,
  slotEnd,
}: MeetingSlotPayload): Promise<void> => {
  const client = new CoreApiClient();

  const participants = await collectPersonMeetingParticipants(client, {
    from: new Date(slotStart),
    to: new Date(slotEnd),
  });

  await applyMeetingInteractions(
    client,
    participants.map(({ personId, calendarEventId }) => ({
      personId,
      calendarEventId,
    })),
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
