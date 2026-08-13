import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { canRescheduleCallRecordingWithoutRecallLookup } from 'src/logic-functions/domain/can-reschedule-call-recording-without-recall-lookup.util';
import { hasUnchangedBotScheduleIdempotencyKey } from 'src/logic-functions/domain/has-unchanged-bot-schedule-idempotency-key.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasMeetingEnded } from 'src/logic-functions/domain/has-meeting-ended.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { findOpenScheduledCallRecordings } from 'src/logic-functions/data/find-open-scheduled-call-recordings.util';
import { findScheduledRecallBotsByCallRecordingId } from 'src/logic-functions/recall-api/find-scheduled-recall-bots-by-call-recording-id.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { attachRecoveredRecallBotToCallRecording } from 'src/logic-functions/data/attach-recovered-recall-bot-to-call-recording.util';
import { resetCallRecordingBotScheduleAttempt } from 'src/logic-functions/data/reset-call-recording-bot-schedule-attempt.util';
import { removeRecallBotOrThrow } from 'src/logic-functions/recall-api/remove-recall-bot-or-throw.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export const BOT_NEVER_SCHEDULED_FAILURE_REASON = 'bot_never_scheduled';
export const BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON =
  'bot_schedule_outcome_unknown';

// Mirrors the stale-state convergence lookback: past it no automatic pull
// pass will resolve the row anymore, so keeping it pending only wastes runs.
const UNRESOLVED_ATTEMPT_MAX_AGE_DAYS = 7;

export type ScheduleRecallBotsForPendingCallRecordingsResult = {
  attachedCallRecordingIds: string[];
  scheduledCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

type ResumableCallRecording = {
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
};

// Resumes a CallRecording inserted before its Recall bot was scheduled.
export const scheduleRecallBotsForPendingCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ScheduleRecallBotsForPendingCallRecordingsResult> => {
  const result: ScheduleRecallBotsForPendingCallRecordingsResult = {
    attachedCallRecordingIds: [],
    scheduledCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
    failedCallRecordingIds: [],
  };
  const pendingCallRecordings = (
    await findOpenScheduledCallRecordings(client)
  ).filter((callRecording) => isUndefined(callRecording.externalBotId));

  if (pendingCallRecordings.length === 0) {
    return result;
  }

  const calendarEventsById = new Map(
    (
      await fetchCalendarEventsByIds(
        client,
        getUniqueSortedIds(
          pendingCallRecordings.map(
            (callRecording) => callRecording.calendarEventId,
          ),
        ),
      )
    ).map((calendarEvent) => [calendarEvent.id, calendarEvent]),
  );
  const resumableCallRecordings: ResumableCallRecording[] = [];

  for (const callRecording of pendingCallRecordings) {
    const calendarEvent = isUndefined(callRecording.calendarEventId)
      ? undefined
      : calendarEventsById.get(callRecording.calendarEventId);

    if (isUndefined(calendarEvent)) {
      continue;
    }

    if (
      hasMeetingEnded({
        startsAt: calendarEvent.startsAt,
        endsAt: calendarEvent.endsAt,
        now,
      })
    ) {
      await resolveEndedPendingCallRecording({
        client,
        callRecording,
        calendarEvent,
        now,
        result,
      });
      continue;
    }

    resumableCallRecordings.push({ callRecording, calendarEvent });
  }

  if (resumableCallRecordings.length === 0) {
    return result;
  }

  // Rows without a schedule-attempt marker never reached Recall, so no bot
  // can exist for them. Rows whose stored idempotency key still matches the
  // current scheduling inputs can re-send the creation and let Recall dedupe
  // it. Only attempts whose inputs drifted since the attempt pay for a
  // Recall lookup.
  const workspaceId = getCurrentWorkspaceId();
  const ambiguousCallRecordings = resumableCallRecordings.filter(
    ({ callRecording, calendarEvent }) =>
      !canRescheduleCallRecordingWithoutRecallLookup({
        callRecording,
        calendarEvent,
        workspaceId,
        now,
      }),
  );
  const unambiguousCallRecordings = resumableCallRecordings.filter(
    ({ callRecording, calendarEvent }) =>
      canRescheduleCallRecordingWithoutRecallLookup({
        callRecording,
        calendarEvent,
        workspaceId,
        now,
      }),
  );

  for (const { callRecording, calendarEvent } of unambiguousCallRecordings) {
    await scheduleBotForResumableCallRecordingSafely({
      client,
      callRecording,
      calendarEvent,
      result,
    });
  }

  if (ambiguousCallRecordings.length === 0) {
    return result;
  }

  // A run that POSTed a bot but died before the id write-back leaves the bot
  // claimable by metadata; one workspace-wide lookup finds them all without a
  // per-recording list call.
  const lookupResult = await findScheduledRecallBotsByCallRecordingId();

  // A failed lookup can hide existing bots; creating one now could duplicate
  // them, so defer to the next run.
  if (!lookupResult.ok) {
    return result;
  }

  for (const { callRecording, calendarEvent } of ambiguousCallRecordings) {
    try {
      const existingRecallBots =
        lookupResult.recallBotsByCallRecordingId.get(callRecording.id) ?? [];
      const canRecoverStoredGeneration =
        isUndefined(callRecording.botScheduleIdempotencyKey) ||
        (!isUndefined(workspaceId) &&
          hasUnchangedBotScheduleIdempotencyKey({
            callRecording,
            calendarEvent,
            workspaceId,
          }));
      const storedGenerationRecallBots = existingRecallBots.filter(
        (bot) =>
          isUndefined(
            normalizeOptionalString(
              bot.metadata.twentyBotScheduleIdempotencyKey,
            ),
          ) ||
          bot.metadata.twentyBotScheduleIdempotencyKey ===
            callRecording.botScheduleIdempotencyKey,
      );
      const storedGenerationExternalBotIds = getUniqueSortedIds(
        storedGenerationRecallBots.map((bot) => bot.id),
      );
      const existingExternalBotId = canRecoverStoredGeneration
        ? storedGenerationExternalBotIds[0]
        : undefined;

      if (!isUndefined(existingExternalBotId)) {
        for (const supersededExternalBotId of storedGenerationExternalBotIds.slice(
          1,
        )) {
          await removeRecallBotOrThrow(supersededExternalBotId);
        }

        const didAttachRecoveredBot =
          await attachRecoveredRecallBotToCallRecording(client, {
            callRecordingId: callRecording.id,
            externalBotId: existingExternalBotId,
            expectedBotScheduleAttemptedAt:
              callRecording.botScheduleAttemptedAt,
            expectedBotScheduleIdempotencyKey:
              callRecording.botScheduleIdempotencyKey,
          });

        if (didAttachRecoveredBot) {
          result.attachedCallRecordingIds.push(callRecording.id);
        }
        continue;
      }

      for (const staleExternalBotId of storedGenerationExternalBotIds) {
        await removeRecallBotOrThrow(staleExternalBotId);
      }

      const didResetScheduleAttempt =
        await resetCallRecordingBotScheduleAttempt(client, {
          callRecordingId: callRecording.id,
          expectedBotScheduleAttemptedAt: callRecording.botScheduleAttemptedAt,
          expectedBotScheduleIdempotencyKey:
            callRecording.botScheduleIdempotencyKey,
        });

      if (!didResetScheduleAttempt) {
        continue;
      }

      await scheduleBotForResumableCallRecording({
        client,
        callRecording,
        calendarEvent,
        result,
      });
    } catch (error) {
      recordCallRecordingScheduleFailure({
        callRecordingId: callRecording.id,
        error,
        result,
      });
    }
  }

  return result;
};

const scheduleBotForResumableCallRecordingSafely = async ({
  client,
  callRecording,
  calendarEvent,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): Promise<void> => {
  try {
    await scheduleBotForResumableCallRecording({
      client,
      callRecording,
      calendarEvent,
      result,
    });
  } catch (error) {
    recordCallRecordingScheduleFailure({
      callRecordingId: callRecording.id,
      error,
      result,
    });
  }
};

const recordCallRecordingScheduleFailure = ({
  callRecordingId,
  error,
  result,
}: {
  callRecordingId: string;
  error: unknown;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): void => {
  console.warn(
    `[call-recorder] failed to schedule Recall bot for callRecording ${callRecordingId}: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  result.failedCallRecordingIds.push(callRecordingId);
};

const scheduleBotForResumableCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): Promise<void> => {
  const didScheduleRecallBot = await scheduleRecallBotForCallRecording(client, {
    callRecording,
    calendarEvent,
  });

  if (didScheduleRecallBot) {
    result.scheduledCallRecordingIds.push(callRecording.id);
  }
};

// Only an absent attempt marker proves no POST reached Recall; a marked row
// may have a bot that joined and recorded before the id write-back was lost,
// so it keeps its recovery chance until the convergence lookback has passed.
const resolveEndedPendingCallRecording = async ({
  client,
  callRecording,
  calendarEvent,
  now,
  result,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
  now: Date;
  result: ScheduleRecallBotsForPendingCallRecordingsResult;
}): Promise<void> => {
  if (isUndefined(callRecording.botScheduleAttemptedAt)) {
    await markCallRecordingFailed({
      client,
      callRecording,
      failureReason: BOT_NEVER_SCHEDULED_FAILURE_REASON,
      logMessage: `call recording ${callRecording.id} never got a Recall bot and its meeting has ended; marking it failed`,
    });
    result.markedFailedCallRecordingIds.push(callRecording.id);

    return;
  }

  if (!hasUnresolvedAttemptAgedOut({ calendarEvent, now })) {
    console.warn(
      `[call-recorder] call recording ${callRecording.id} has an unresolved Recall bot creation attempt and its meeting has ended; waiting for convergence`,
    );

    return;
  }

  await markCallRecordingFailed({
    client,
    callRecording,
    failureReason: BOT_SCHEDULE_OUTCOME_UNKNOWN_FAILURE_REASON,
    logMessage: `call recording ${callRecording.id} has an unresolved Recall bot creation attempt older than the convergence lookback; marking it failed`,
  });
  result.markedFailedCallRecordingIds.push(callRecording.id);
};

const hasUnresolvedAttemptAgedOut = ({
  calendarEvent,
  now,
}: {
  calendarEvent: CalendarEventRecord;
  now: Date;
}): boolean => {
  // Mirrors hasMeetingEnded: an unparseable end time falls back to the start
  // time so these rows still age out of the pending sweep eventually.
  const meetingEndTime = [calendarEvent.endsAt, calendarEvent.startsAt]
    .filter((candidate) => !isUndefined(candidate))
    .map((candidate) => new Date(candidate).getTime())
    .find((candidateTime) => !Number.isNaN(candidateTime));

  return (
    !isUndefined(meetingEndTime) &&
    meetingEndTime + UNRESOLVED_ATTEMPT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000 <=
      now.getTime()
  );
};

const markCallRecordingFailed = async ({
  client,
  callRecording,
  failureReason,
  logMessage,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  failureReason: string;
  logMessage: string;
}): Promise<void> => {
  console.warn(`[call-recorder] ${logMessage}`);

  await updateCallRecording(client, {
    id: callRecording.id,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: failureReason,
    },
  });
};
