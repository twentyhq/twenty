import { CoreApiClient } from 'twenty-client-sdk/core';

import { APPLICATION_ID_ENV_VAR_NAME } from 'src/logic-functions/constants/application-id-env-var-name';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type RecallRecordingBotPolicyResultForMeeting } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-meeting.type';
import { type RecallRecordingBotReconciliationResult } from 'src/logic-functions/types/recall-recording-bot-reconciliation-result.type';
import { type RemovedRecallRecordingBotOccurrence } from 'src/logic-functions/types/removed-recall-recording-bot-occurrence.type';
import { aggregateRecallRecordingBotPolicyResultsByMeeting } from 'src/logic-functions/utils/aggregate-recall-recording-bot-policy-results-by-meeting.util';
import { buildRecallRecordingBotPolicyResult } from 'src/logic-functions/utils/build-recall-recording-bot-policy-result.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/utils/cancel-call-recording-request.util';
import { cancelRecallRecordingBot } from 'src/logic-functions/utils/cancel-recall-recording-bot.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/utils/compute-call-recording-id-for-meeting.util';
import {
  createCallRecording,
  type ScheduledCallRecordingFields,
} from 'src/logic-functions/utils/create-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/utils/fetch-calendar-events-by-ids.util';
import { fetchCalendarEventsByStartsAtValues } from 'src/logic-functions/utils/fetch-calendar-events-by-starts-at-values.util';
import { findCallRecordingsByCalendarEventIds } from 'src/logic-functions/utils/find-call-recordings-by-calendar-event-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/utils/find-call-recordings-by-ids.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getRecallRecordingBotEnabled } from 'src/logic-functions/utils/get-recall-recording-bot-enabled.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { isWithinRecallBotAutoRecordJoinWindow } from 'src/logic-functions/utils/is-within-recall-bot-auto-record-join-window.util';
import { rescheduleRecallRecordingBot } from 'src/logic-functions/utils/reschedule-recall-recording-bot.util';
import { scheduleRecallRecordingBot } from 'src/logic-functions/utils/schedule-recall-recording-bot.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/utils/update-call-recording.util';

export const reconcileRecallRecordingBotForCalendarEventIds = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedRecallRecordingBotOccurrence[];
  now?: Date;
}): Promise<RecallRecordingBotReconciliationResult[]> => {
  const meetingPolicyResults =
    await resolveRecallRecordingBotMeetingPolicyResults({
      client,
      calendarEventIds,
      removedOccurrences,
      now,
    });

  return reconcileRecallRecordingBotMeetingOccurrences({
    client,
    meetingPolicyResults,
    removedOccurrences,
    now,
  });
};

const resolveRecallRecordingBotMeetingPolicyResults = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedRecallRecordingBotOccurrence[];
  now?: Date;
}): Promise<RecallRecordingBotPolicyResultForMeeting[]> => {
  const isRecallRecordingBotEnabledForWorkspace =
    getRecallRecordingBotEnabled();
  const changedCalendarEvents = await fetchCalendarEventsByIds(
    client,
    getUniqueSortedIds(calendarEventIds),
  );
  const affectedMeetingKeys = new Set<string>();
  const occurrenceStartsAtAnchors = new Set<string>();
  const changedCalendarEventPolicyResults = changedCalendarEvents.map(
    (calendarEvent) =>
      buildRecallRecordingBotPolicyResult(calendarEvent, {
        isRecallRecordingBotEnabledForWorkspace,
        now,
      }),
  );

  for (const policyResult of changedCalendarEventPolicyResults) {
    affectedMeetingKeys.add(policyResult.realMeetingKey);
  }

  for (const calendarEvent of changedCalendarEvents) {
    if (calendarEvent.startsAt !== null) {
      occurrenceStartsAtAnchors.add(calendarEvent.startsAt);
    }
  }

  for (const removedOccurrence of removedOccurrences) {
    affectedMeetingKeys.add(removedOccurrence.realMeetingKey);

    if (removedOccurrence.startsAt !== null) {
      occurrenceStartsAtAnchors.add(removedOccurrence.startsAt);
    }
  }

  if (affectedMeetingKeys.size === 0) {
    return [];
  }

  const occurrenceSiblingEvents = await fetchCalendarEventsByStartsAtValues(
    client,
    [...occurrenceStartsAtAnchors],
  );
  const policyResultsByCalendarEventId = new Map(
    changedCalendarEventPolicyResults.map((policyResult) => [
      policyResult.calendarEventId,
      policyResult,
    ]),
  );

  for (const calendarEvent of occurrenceSiblingEvents) {
    if (policyResultsByCalendarEventId.has(calendarEvent.id)) {
      continue;
    }

    policyResultsByCalendarEventId.set(
      calendarEvent.id,
      buildRecallRecordingBotPolicyResult(calendarEvent, {
        isRecallRecordingBotEnabledForWorkspace,
        now,
      }),
    );
  }

  const perCalendarEventPolicyResults = [
    ...policyResultsByCalendarEventId.values(),
  ]
    .filter((policyResult) =>
      affectedMeetingKeys.has(policyResult.realMeetingKey),
    )
    .map((policyResult) => ({
      calendarEventId: policyResult.calendarEventId,
      realMeetingKey: policyResult.realMeetingKey,
      shouldRequestBot: policyResult.shouldRequestBot,
    }));
  const meetingPolicyResults =
    aggregateRecallRecordingBotPolicyResultsByMeeting(
      perCalendarEventPolicyResults,
    );
  const meetingKeysWithPolicyResult = new Set(
    meetingPolicyResults.map(
      (meetingPolicyResult) => meetingPolicyResult.realMeetingKey,
    ),
  );

  for (const meetingKey of [...affectedMeetingKeys].sort()) {
    if (meetingKeysWithPolicyResult.has(meetingKey)) {
      continue;
    }

    meetingPolicyResults.push({
      realMeetingKey: meetingKey,
      shouldRequestBot: false,
      calendarEventIds: [],
      requestingCalendarEventIds: [],
    });
  }

  return meetingPolicyResults;
};

const reconcileRecallRecordingBotMeetingOccurrences = async ({
  client,
  meetingPolicyResults,
  removedOccurrences = [],
  now,
}: {
  client: CoreApiClient;
  meetingPolicyResults: RecallRecordingBotPolicyResultForMeeting[];
  removedOccurrences?: RemovedRecallRecordingBotOccurrence[];
  now: Date;
}): Promise<RecallRecordingBotReconciliationResult[]> => {
  const removedCalendarEventIdsByMeetingKey =
    buildRemovedCalendarEventIdsByMeetingKey(removedOccurrences);
  const reconciliationResults: RecallRecordingBotReconciliationResult[] = [];
  const orderedMeetingPolicyResults = [
    ...meetingPolicyResults.filter(
      (meetingPolicyResult) => !meetingPolicyResult.shouldRequestBot,
    ),
    ...meetingPolicyResults.filter(
      (meetingPolicyResult) => meetingPolicyResult.shouldRequestBot,
    ),
  ];

  for (const meetingPolicyResult of orderedMeetingPolicyResults) {
    const removedCalendarEventIds =
      removedCalendarEventIdsByMeetingKey.get(
        meetingPolicyResult.realMeetingKey,
      ) ?? [];

    try {
      reconciliationResults.push(
        meetingPolicyResult.shouldRequestBot
          ? await reconcileActiveMeeting({
              client,
              meetingPolicyResult,
              removedCalendarEventIds,
              now,
            })
          : await reconcileCanceledMeeting({
              client,
              meetingPolicyResult,
              removedCalendarEventIds,
            }),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[recall-recording-bot] reconciliation failed for meeting ${meetingPolicyResult.realMeetingKey}: ${errorMessage}`,
      );
      reconciliationResults.push({
        action: 'FAILED',
        realMeetingKey: meetingPolicyResult.realMeetingKey,
        errorMessage,
      });
    }
  }

  return reconciliationResults;
};

const reconcileActiveMeeting = async ({
  client,
  meetingPolicyResult,
  removedCalendarEventIds,
  now,
}: {
  client: CoreApiClient;
  meetingPolicyResult: RecallRecordingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
  now: Date;
}): Promise<RecallRecordingBotReconciliationResult> => {
  const representativeCalendarEventId = getUniqueSortedIds(
    meetingPolicyResult.requestingCalendarEventIds,
  )[0];

  if (representativeCalendarEventId === undefined) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  const representativeCalendarEvent = (
    await fetchCalendarEventsByIds(client, [representativeCalendarEventId])
  )[0];

  if (representativeCalendarEvent === undefined) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  const callRecordingId = computeCallRecordingIdForMeeting(
    meetingPolicyResult.realMeetingKey,
  );
  const existingCallRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (existingCallRecording !== undefined) {
    return updatePolicyManagedCallRecording({
      client,
      existingCallRecording,
      representativeCalendarEvent,
      realMeetingKey: meetingPolicyResult.realMeetingKey,
    });
  }

  const manualOpenCallRecording = await findManualOpenCallRecording({
    client,
    meetingPolicyResult,
    removedCalendarEventIds,
  });

  if (manualOpenCallRecording !== undefined) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: manualOpenCallRecording.id,
    };
  }

  if (
    representativeCalendarEvent.meetingBotPreference !==
      RecallRecordingBotPreference.ON &&
    !isWithinRecallBotAutoRecordJoinWindow({
      startsAt: representativeCalendarEvent.startsAt,
      now,
    })
  ) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  return createPolicyManagedCallRecording({
    client,
    callRecordingId,
    representativeCalendarEvent,
    realMeetingKey: meetingPolicyResult.realMeetingKey,
  });
};

const updatePolicyManagedCallRecording = async ({
  client,
  existingCallRecording,
  representativeCalendarEvent,
  realMeetingKey,
}: {
  client: CoreApiClient;
  existingCallRecording: CallRecordingRecord;
  representativeCalendarEvent: CalendarEventRecord;
  realMeetingKey: string;
}): Promise<RecallRecordingBotReconciliationResult> => {
  await updateCallRecording(client, {
    id: existingCallRecording.id,
    data: buildPolicyManagedCallRecordingUpdateFields({
      existingCallRecording,
      calendarEvent: representativeCalendarEvent,
    }),
  });
  await syncScheduledRecallBot({
    client,
    callRecordingId: existingCallRecording.id,
    representativeCalendarEvent,
    realMeetingKey,
  });

  return {
    action: 'UPDATED',
    realMeetingKey,
    callRecordingId: existingCallRecording.id,
  };
};

const createPolicyManagedCallRecording = async ({
  client,
  callRecordingId,
  representativeCalendarEvent,
  realMeetingKey,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  representativeCalendarEvent: CalendarEventRecord;
  realMeetingKey: string;
}): Promise<RecallRecordingBotReconciliationResult> => {
  try {
    await createCallRecording(client, {
      id: callRecordingId,
      data: buildScheduledCallRecordingFields(representativeCalendarEvent),
    });
  } catch (error) {
    // The id is deterministic, so a conflict means a concurrent run created the row first.
    const concurrentlyCreatedCallRecording = (
      await findCallRecordingsByIds(client, [callRecordingId])
    )[0];

    if (concurrentlyCreatedCallRecording === undefined) {
      throw error;
    }

    return updatePolicyManagedCallRecording({
      client,
      existingCallRecording: concurrentlyCreatedCallRecording,
      representativeCalendarEvent,
      realMeetingKey,
    });
  }

  await syncScheduledRecallBot({
    client,
    callRecordingId,
    representativeCalendarEvent,
    realMeetingKey,
  });

  return {
    action: 'CREATED',
    realMeetingKey,
    callRecordingId,
  };
};

const findManualOpenCallRecording = async ({
  client,
  meetingPolicyResult,
  removedCalendarEventIds,
}: {
  client: CoreApiClient;
  meetingPolicyResult: RecallRecordingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
}): Promise<CallRecordingRecord | undefined> => {
  const calendarEventIds = getUniqueSortedIds([
    ...meetingPolicyResult.calendarEventIds,
    ...meetingPolicyResult.requestingCalendarEventIds,
    ...removedCalendarEventIds,
  ]);
  const callRecordings = await findCallRecordingsByCalendarEventIds(
    client,
    calendarEventIds,
  );

  return [...callRecordings]
    .sort((firstCallRecording, secondCallRecording) =>
      firstCallRecording.id.localeCompare(secondCallRecording.id),
    )
    .find(
      (callRecording) =>
        callRecording.status !== CallRecordingStatus.COMPLETED &&
        !isNonEmptyString(callRecording.recordingRequestStatus),
    );
};

const reconcileCanceledMeeting = async ({
  client,
  meetingPolicyResult,
  removedCalendarEventIds,
}: {
  client: CoreApiClient;
  meetingPolicyResult: RecallRecordingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
}): Promise<RecallRecordingBotReconciliationResult> => {
  const calendarEventIds = getUniqueSortedIds([
    ...meetingPolicyResult.calendarEventIds,
    ...removedCalendarEventIds,
  ]);
  const cancellableCallRecordings = (
    await findCallRecordingsByCalendarEventIds(client, calendarEventIds)
  ).filter(
    (callRecording) =>
      callRecording.status === CallRecordingStatus.SCHEDULED &&
      callRecording.recordingRequestStatus ===
        CallRecordingRequestStatus.REQUESTED,
  );

  if (cancellableCallRecordings.length === 0) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  for (const callRecording of cancellableCallRecordings) {
    await cancelCallRecordingRequest({
      client,
      callRecording,
    });
  }

  return {
    action: 'CANCELED',
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    callRecordingId: cancellableCallRecordings[0].id,
  };
};

// startedAt/endedAt come from the webhook; calendar writes never touch them.
const buildCalendarDrivenCallRecordingFields = (
  calendarEvent: CalendarEventRecord,
): Omit<ScheduledCallRecordingFields, 'status'> => ({
  title: calendarEvent.title,
  recordingRequestStatus: CallRecordingRequestStatus.REQUESTED,
  calendarEventId: calendarEvent.id,
});

const buildScheduledCallRecordingFields = (
  calendarEvent: CalendarEventRecord,
): ScheduledCallRecordingFields => ({
  ...buildCalendarDrivenCallRecordingFields(calendarEvent),
  status: CallRecordingStatus.SCHEDULED,
});

// A live or finished bot lifecycle must never be reset to SCHEDULED by a calendar-driven update.
const buildPolicyManagedCallRecordingUpdateFields = ({
  existingCallRecording,
  calendarEvent,
}: {
  existingCallRecording: CallRecordingRecord;
  calendarEvent: CalendarEventRecord;
}): CallRecordingUpdateFields =>
  canResetCallRecordingStatusToScheduled(existingCallRecording.status)
    ? buildScheduledCallRecordingFields(calendarEvent)
    : buildCalendarDrivenCallRecordingFields(calendarEvent);

const canResetCallRecordingStatusToScheduled = (
  status: string | null | undefined,
): boolean =>
  status === CallRecordingStatus.SCHEDULED ||
  status === CallRecordingStatus.FAILED_UNKNOWN;

const syncScheduledRecallBot = async ({
  client,
  callRecordingId,
  representativeCalendarEvent,
  realMeetingKey,
}: {
  client: CoreApiClient;
  callRecordingId: string;
  representativeCalendarEvent: CalendarEventRecord;
  realMeetingKey: string;
}): Promise<void> => {
  const meetingUrl =
    representativeCalendarEvent.conferenceLink?.primaryLinkUrl ?? null;
  const joinAt = representativeCalendarEvent.startsAt;

  if (meetingUrl === null || joinAt === null) {
    return;
  }

  // Re-read: a concurrent run may have canceled this recording or attached a bot.
  const callRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (
    callRecording === undefined ||
    callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.REQUESTED
  ) {
    return;
  }

  const applicationId = getApplicationVariableValue(
    APPLICATION_ID_ENV_VAR_NAME,
  );
  const metadata = {
    twentyCallRecordingId: callRecordingId,
    twentyCalendarEventId: representativeCalendarEvent.id,
    twentyRealMeetingKey: realMeetingKey,
    ...(applicationId === undefined
      ? {}
      : { twentyApplicationId: applicationId }),
  };
  const externalBotId = callRecording.externalBotId ?? null;

  if (externalBotId !== null) {
    const rescheduleResult = await rescheduleRecallRecordingBot({
      externalBotId,
      meetingUrl,
      joinAt,
      metadata,
    });

    if (rescheduleResult.ok) {
      return;
    }

    if (rescheduleResult.status !== 404) {
      console.warn(
        `[recall-recording-bot] failed to update Recall bot for callRecording ${callRecordingId}: ${rescheduleResult.errorMessage}`,
      );

      return;
    }

    console.warn(
      `[recall-recording-bot] Recall bot ${externalBotId} for callRecording ${callRecordingId} no longer exists, scheduling a replacement`,
    );
  }

  const scheduleResult = await scheduleRecallRecordingBot({
    meetingUrl,
    joinAt,
    metadata,
  });

  if (!scheduleResult.ok) {
    console.warn(
      `[recall-recording-bot] failed to schedule Recall bot for callRecording ${callRecordingId}: ${scheduleResult.errorMessage}`,
    );

    return;
  }

  if (scheduleResult.externalBotId !== null) {
    await updateCallRecording(client, {
      id: callRecordingId,
      data: {
        externalBotId: scheduleResult.externalBotId,
      },
    });

    // A superseded bot would still join the meeting as an extra attendee; cancel it.
    const callRecordingAfterWrite = (
      await findCallRecordingsByIds(client, [callRecordingId])
    )[0];

    if (
      callRecordingAfterWrite?.externalBotId !== scheduleResult.externalBotId
    ) {
      console.warn(
        `[recall-recording-bot] bot ${scheduleResult.externalBotId} for callRecording ${callRecordingId} was superseded by a concurrent schedule, canceling it`,
      );
      await cancelRecallRecordingBot({
        externalBotId: scheduleResult.externalBotId,
      });
    }
  }
};

const buildRemovedCalendarEventIdsByMeetingKey = (
  removedOccurrences: RemovedRecallRecordingBotOccurrence[],
): Map<string, string[]> => {
  const calendarEventIdsByMeetingKey = new Map<string, string[]>();

  for (const removedOccurrence of removedOccurrences) {
    calendarEventIdsByMeetingKey.set(removedOccurrence.realMeetingKey, [
      ...(calendarEventIdsByMeetingKey.get(removedOccurrence.realMeetingKey) ??
        []),
      removedOccurrence.calendarEventId,
    ]);
  }

  return calendarEventIdsByMeetingKey;
};

const buildSkippedResult = (
  realMeetingKey: string,
): RecallRecordingBotReconciliationResult => ({
  action: 'SKIPPED',
  realMeetingKey,
  callRecordingId: null,
});
