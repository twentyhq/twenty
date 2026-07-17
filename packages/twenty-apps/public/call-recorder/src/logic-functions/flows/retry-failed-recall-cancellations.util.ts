import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { replaceCanceledCallRecordingExternalBotId } from 'src/logic-functions/data/replace-canceled-call-recording-external-bot-id.util';
import { cancelOrEjectRecallBot } from 'src/logic-functions/recall-api/cancel-or-eject-recall-bot.util';
import { findScheduledRecallBotIdForCallRecording } from 'src/logic-functions/recall-api/find-scheduled-recall-bot-id-for-call-recording.util';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';

export type RetryFailedRecallCancellationsResult = {
  canceledExternalBotCallRecordingIds: string[];
};

const CANCELED_BOT_RECOVERY_AFTER_START_HOURS = 24;
const CANCELED_BOT_RECOVERY_MAX_AGE_HOURS = 24;

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
      await replaceCanceledCallRecordingExternalBotId(client, {
        id: callRecording.id,
        expectedExternalBotId: externalBotId,
        nextExternalBotId: null,
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

  if (
    !isUndefined(calendarEvent) &&
    hasMeetingEnded({
      startsAt: calendarEvent.startsAt,
      endsAt: calendarEvent.endsAt,
      now,
      startGraceHours: CANCELED_BOT_RECOVERY_AFTER_START_HOURS,
    })
  ) {
    return undefined;
  }

  // Recovery only closes the crash window right after cancellation; once a row ages out the daily cleanup sweep owns it, so stop the per-run Recall lookup instead of listing forever (notably for rows whose calendar event was deleted and can no longer bound the retry).
  // updatedAt tracks the cancellation write, so a request scheduled far ahead but canceled recently still gets its window; createdAt would age it out from scheduling time.
  if (
    hasCanceledRecoveryWindowElapsed({
      canceledAt: callRecording.updatedAt ?? callRecording.createdAt,
      now,
    })
  ) {
    return undefined;
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

  const externalBotId = scheduledRecallBotLookupResult.externalBotId;
  const didClaimRecoveredBot = await replaceCanceledCallRecordingExternalBotId(
    client,
    {
      id: callRecording.id,
      expectedExternalBotId: null,
      nextExternalBotId: externalBotId,
    },
  );

  return didClaimRecoveredBot ? externalBotId : undefined;
};

const hasCanceledRecoveryWindowElapsed = ({
  canceledAt,
  now,
}: {
  canceledAt: string | undefined;
  now: Date;
}): boolean => {
  if (isUndefined(canceledAt)) {
    return false;
  }

  const canceledTime = new Date(canceledAt).getTime();

  return (
    !Number.isNaN(canceledTime) &&
    canceledTime + CANCELED_BOT_RECOVERY_MAX_AGE_HOURS * 60 * 60 * 1000 <=
      now.getTime()
  );
};
