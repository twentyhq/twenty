import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type DatabaseEventPayload,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/logic-function';

import { ON_SALES_NOTE_MEETING_SET_LOGIC_FUNCTION_UID } from 'src/constants/universal-identifiers';
import { inheritMeetingAttendees } from 'src/utils/inherit-meeting-attendees';

// When a user (or the API) updates an existing salesNote and sets its
// `meetingId` for the first time, inherit the linked calendar event's
// matched attendees onto this Call Report. Fires on `salesNote.updated`.
//
// Only fires when meetingId TRANSITIONS to a non-null value — i.e. before
// is null/empty and after is set. We don't re-run on every update.
// Subsequent changes (linking a different meeting) are also handled because
// the before-was-null branch only filters the initial-set case; if the user
// changes meeting from A to B, both have non-null values so we'd otherwise
// skip — handled below by also firing when before/after differ.
//
// Idempotency: inheritMeetingAttendees deduplicates by personId, so re-runs
// for the same meeting are a no-op.

type SalesNoteAfter = {
  meetingId?: string | null;
};

type SalesNoteUpdateEvent = DatabaseEventPayload<
  ObjectRecordUpdateEvent<SalesNoteAfter>
>;

const handler = async (
  event: SalesNoteUpdateEvent,
): Promise<object | undefined> => {
  const before = event.properties.before;
  const after = event.properties.after;
  const beforeMeetingId = before?.meetingId ?? null;
  const afterMeetingId = after?.meetingId ?? null;

  if (typeof afterMeetingId !== 'string' || afterMeetingId.length === 0) {
    return { skipped: true, reason: 'no meetingId on after' };
  }

  if (beforeMeetingId === afterMeetingId) {
    return { skipped: true, reason: 'meetingId unchanged' };
  }

  const client = new CoreApiClient();
  const outcome = await inheritMeetingAttendees(
    client,
    event.recordId,
    afterMeetingId,
  );

  // eslint-disable-next-line no-console
  console.error(
    `[on-sales-note-meeting-set] salesNoteId=${event.recordId} meetingId=${afterMeetingId} added=${outcome.added} skipped=${outcome.skipped}` +
      (outcome.reason ? ` (${outcome.reason})` : ''),
  );

  return {
    salesNoteId: event.recordId,
    meetingId: afterMeetingId,
    ...outcome,
  };
};

export default defineLogicFunction({
  universalIdentifier: ON_SALES_NOTE_MEETING_SET_LOGIC_FUNCTION_UID,
  name: 'on-sales-note-meeting-set',
  description:
    "When a salesNote.meetingId is set or changed, inherit the linked calendar event's matched participants as salesNoteAttendees. Idempotent; skips People who are already attendees.",
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'salesNote.updated',
  },
});
