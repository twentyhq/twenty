import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type MeetingRecording } from 'src/logic-functions/types/meeting-recording.type';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';

export type FindResumablePendingCallRecordingResult =
  | ({ status: 'resumable' } & MeetingRecording)
  | { status: 'skipped'; reason: string };

export const findResumablePendingCallRecording = async ({
  client,
  callRecordingId,
  now,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  now: Date;
}): Promise<FindResumablePendingCallRecordingResult> => {
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (isUndefined(callRecording)) {
    return { status: 'skipped', reason: 'call recording not found' };
  }

  if (
    callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED ||
    callRecording.status !== CallRecordingStatus.SCHEDULED ||
    !isUndefined(callRecording.externalBotId)
  ) {
    return { status: 'skipped', reason: 'call recording is not pending' };
  }

  if (isUndefined(callRecording.calendarEventId)) {
    return { status: 'skipped', reason: 'no calendar event attached' };
  }

  const calendarEvent = (
    await fetchCalendarEventsByIds(client, [callRecording.calendarEventId])
  )[0];

  if (isUndefined(calendarEvent)) {
    return { status: 'skipped', reason: 'calendar event not found' };
  }

  if (
    hasMeetingEnded({
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      now,
    })
  ) {
    // The recovery cron owns failing rows whose meeting is over.
    return { status: 'skipped', reason: 'meeting already ended' };
  }

  return { status: 'resumable', callRecording, calendarEvent };
};
