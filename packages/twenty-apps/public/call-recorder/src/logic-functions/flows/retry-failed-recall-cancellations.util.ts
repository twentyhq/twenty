import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { attachExistingRecallBotToCallRecording } from 'src/logic-functions/flows/attach-existing-recall-bot-to-call-recording.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
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
    let externalBotId = callRecording.externalBotId;

    if (isUndefined(externalBotId)) {
      const calendarEvent = isUndefined(callRecording.calendarEventId)
        ? undefined
        : calendarEventsById.get(callRecording.calendarEventId);

      if (
        isUndefined(calendarEvent) ||
        hasMeetingEnded({
          startsAt: calendarEvent.startsAt,
          endsAt: calendarEvent.endsAt,
          now,
        })
      ) {
        continue;
      }

      const attachResult = await attachExistingRecallBotToCallRecording(
        client,
        { callRecording, calendarEvent },
      );

      if (attachResult.status !== 'attached') {
        continue;
      }

      externalBotId = attachResult.externalBotId;
    }

    if (!(await cancelOrEjectRecallBot(externalBotId))) {
      continue;
    }

    await updateCallRecording(client, {
      id: callRecording.id,
      data: { externalBotId: null },
    });
    canceledExternalBotCallRecordingIds.push(callRecording.id);
  }

  return { canceledExternalBotCallRecordingIds };
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
