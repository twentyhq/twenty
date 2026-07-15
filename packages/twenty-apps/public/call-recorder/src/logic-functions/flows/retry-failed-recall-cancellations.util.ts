import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { attachExistingRecallBotToCallRecording } from 'src/logic-functions/flows/attach-existing-recall-bot-to-call-recording.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { findScheduledRecallBotIdForCallRecording } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-id-for-call-recording.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export type RetryFailedRecallCancellationsResult = {
  canceledExternalBotCallRecordingIds: string[];
};

// Retries the Recall half of cancelCallRecordingRequest when its bot cancel failed; the recording keeps its bot id until the bot is confirmed gone.
export const retryFailedRecallCancellations = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<RetryFailedRecallCancellationsResult> => {
  const canceledCallRecordings = await findCallRecordingsByFilter(client, {
    recordingRequestStatus: { eq: CallRecordingRequestStatus.CANCELED },
    status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
  });
  const botlessCanceledCallRecordings = canceledCallRecordings.filter(
    (callRecording) => isUndefined(callRecording.externalBotId),
  );
  const calendarEventsById = new Map(
    (
      await fetchCalendarEventsByIds(
        client,
        getUniqueSortedIds(
          botlessCanceledCallRecordings.map(
            (callRecording) => callRecording.calendarEventId,
          ),
        ),
      )
    ).map((calendarEvent) => [calendarEvent.id, calendarEvent]),
  );
  const canceledExternalBotCallRecordingIds: string[] = [];

  for (const callRecording of canceledCallRecordings) {
    const calendarEvent = isUndefined(callRecording.calendarEventId)
      ? undefined
      : calendarEventsById.get(callRecording.calendarEventId);
    const externalBotId = await recoverRecallBotIdForCanceledCallRecording({
      client,
      callRecording,
      calendarEvent,
      now,
    });

    if (isUndefined(externalBotId)) {
      continue;
    }

    // Calendar reconciliation can reactivate the request while this job is running.
    const latestCallRecording = (
      await findCallRecordingsByIds(client, [callRecording.id])
    )[0];

    if (
      latestCallRecording?.recordingRequestStatus !==
        CallRecordingRequestStatus.CANCELED ||
      (!isUndefined(latestCallRecording.externalBotId) &&
        latestCallRecording.externalBotId !== externalBotId)
    ) {
      continue;
    }

    if (!(await cancelOrEjectRecallBot(externalBotId))) {
      continue;
    }

    if (latestCallRecording.externalBotId === externalBotId) {
      await updateCallRecording(client, {
        id: callRecording.id,
        data: { externalBotId: null },
      });
    }

    canceledExternalBotCallRecordingIds.push(callRecording.id);
  }

  return { canceledExternalBotCallRecordingIds };
};

const recoverRecallBotIdForCanceledCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  now,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord | undefined;
  now: Date;
}): Promise<string | undefined> => {
  if (!isUndefined(callRecording.externalBotId)) {
    return callRecording.externalBotId;
  }

  if (!isUndefined(calendarEvent)) {
    if (
      hasMeetingEnded({
        startsAt: calendarEvent.startsAt,
        endsAt: calendarEvent.endsAt,
        now,
      })
    ) {
      return undefined;
    }

    const existingRecallBotAttachmentResult =
      await attachExistingRecallBotToCallRecording(client, {
        callRecording,
        calendarEvent,
      });

    return existingRecallBotAttachmentResult.status === 'attached'
      ? existingRecallBotAttachmentResult.externalBotId
      : undefined;
  }

  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    return undefined;
  }

  const scheduledRecallBotLookupResult =
    await findScheduledRecallBotIdForCallRecording({
      callRecordingId: callRecording.id,
      workspaceId: currentWorkspaceId,
    });

  if (
    !scheduledRecallBotLookupResult.ok ||
    isUndefined(scheduledRecallBotLookupResult.externalBotId)
  ) {
    return undefined;
  }

  return scheduledRecallBotLookupResult.externalBotId;
};

const hasMeetingEnded = ({
  startsAt,
  endsAt,
  now,
}: {
  startsAt: string | undefined;
  endsAt: string | undefined;
  now: Date;
}): boolean => {
  const meetingEndReference = endsAt ?? startsAt;

  if (isUndefined(meetingEndReference)) {
    return false;
  }

  const meetingEndTime = new Date(meetingEndReference).getTime();

  return !Number.isNaN(meetingEndTime) && meetingEndTime <= now.getTime();
};
