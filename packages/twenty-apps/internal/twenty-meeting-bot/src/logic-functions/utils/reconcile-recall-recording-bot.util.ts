import { CoreApiClient } from 'twenty-client-sdk/core';

import { APPLICATION_ID_ENV_VAR_NAME } from 'src/logic-functions/constants/application-id-env-var-name';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type RecallRecordingBotPolicyResultForMeeting } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-meeting.type';
import { type RecallRecordingBotReconciliationResult } from 'src/logic-functions/types/recall-recording-bot-reconciliation-result.type';
import { type RemovedRecallRecordingBotOccurrence } from 'src/logic-functions/types/removed-recall-recording-bot-occurrence.type';
import { aggregateRecallRecordingBotPolicyResultsByMeeting } from 'src/logic-functions/utils/aggregate-recall-recording-bot-policy-results-by-meeting.util';
import { buildRecallRecordingBotPolicyResult } from 'src/logic-functions/utils/build-recall-recording-bot-policy-result.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/utils/cancel-call-recording-request.util';
import { cancelRecallRecordingBot } from 'src/logic-functions/utils/cancel-recall-recording-bot.util';
import {
  createCallRecording,
  type ScheduledCallRecordingFields,
} from 'src/logic-functions/utils/create-call-recording.util';
import { deleteCallRecording } from 'src/logic-functions/utils/delete-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/utils/fetch-calendar-events-by-ids.util';
import { fetchCalendarEventsByStartsAtValues } from 'src/logic-functions/utils/fetch-calendar-events-by-starts-at-values.util';
import { findCallRecordingsByCalendarEventIds } from 'src/logic-functions/utils/find-call-recordings-by-calendar-event-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/utils/find-call-recordings-by-ids.util';
import { getApplicationVariableValue } from 'src/logic-functions/utils/get-application-variable-value.util';
import { getRecallRecordingBotEnabled } from 'src/logic-functions/utils/get-recall-recording-bot-enabled.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
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
}: {
  client: CoreApiClient;
  meetingPolicyResults: RecallRecordingBotPolicyResultForMeeting[];
  removedOccurrences?: RemovedRecallRecordingBotOccurrence[];
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
}: {
  client: CoreApiClient;
  meetingPolicyResult: RecallRecordingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
}): Promise<RecallRecordingBotReconciliationResult> => {
  const calendarEventIds = getUniqueSortedIds([
    ...meetingPolicyResult.calendarEventIds,
    ...meetingPolicyResult.requestingCalendarEventIds,
    ...removedCalendarEventIds,
  ]);
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

  const existingCallRecordings = await findCallRecordingsByCalendarEventIds(
    client,
    calendarEventIds,
  );
  const [primaryCallRecording, ...duplicateCallRecordings] =
    getPolicyManagedCallRecordingsByPriority(existingCallRecordings);

  await cancelDuplicateCallRecordingRequests({
    client,
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    duplicateCallRecordings,
  });

  if (primaryCallRecording !== undefined) {
    await updateCallRecording(client, {
      id: primaryCallRecording.id,
      data: buildPolicyManagedCallRecordingUpdateFields({
        existingCallRecording: primaryCallRecording,
        calendarEvent: representativeCalendarEvent,
      }),
    });
    await syncScheduledRecallBot({
      client,
      callRecordingId: primaryCallRecording.id,
      representativeCalendarEvent,
      realMeetingKey: meetingPolicyResult.realMeetingKey,
    });

    return {
      action: 'UPDATED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: primaryCallRecording.id,
    };
  }

  const existingNonPolicyManagedOpenCallRecording =
    getFirstNonPolicyManagedOpenCallRecording(existingCallRecordings);

  if (existingNonPolicyManagedOpenCallRecording !== undefined) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: existingNonPolicyManagedOpenCallRecording.id,
    };
  }

  const createdCallRecordingId = await createCallRecording(
    client,
    buildScheduledCallRecordingFields(representativeCalendarEvent),
  );

  // Concurrent runs can all pass the read above; only the canonical one schedules.
  const callRecordingsAfterCreate = await findCallRecordingsByCalendarEventIds(
    client,
    calendarEventIds,
  );
  const [canonicalCallRecording] = getPolicyManagedCallRecordingsByPriority(
    callRecordingsAfterCreate,
  );

  if (
    canonicalCallRecording !== undefined &&
    canonicalCallRecording.id !== createdCallRecordingId
  ) {
    const createdCallRecording = callRecordingsAfterCreate.find(
      (callRecording) => callRecording.id === createdCallRecordingId,
    );

    if (createdCallRecording !== undefined) {
      await cancelCallRecordingRequest({
        client,
        callRecording: createdCallRecording,
      });
    }

    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: canonicalCallRecording.id,
    };
  }

  await syncScheduledRecallBot({
    client,
    callRecordingId: createdCallRecordingId,
    representativeCalendarEvent,
    realMeetingKey: meetingPolicyResult.realMeetingKey,
  });

  return {
    action: 'CREATED',
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    callRecordingId: createdCallRecordingId,
  };
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

const cancelDuplicateCallRecordingRequests = async ({
  client,
  realMeetingKey,
  duplicateCallRecordings,
}: {
  client: CoreApiClient;
  realMeetingKey: string;
  duplicateCallRecordings: CallRecordingRecord[];
}): Promise<void> => {
  // Bot-less REQUESTED duplicates have no external state; delete, don't cancel.
  const duplicatesToDelete = duplicateCallRecordings.filter(
    (callRecording) =>
      callRecording.recordingRequestStatus ===
        CallRecordingRequestStatus.REQUESTED &&
      !isNonEmptyString(callRecording.externalBotId),
  );
  const duplicatesToCancel = duplicateCallRecordings.filter((callRecording) =>
    isNonEmptyString(callRecording.externalBotId),
  );

  if (duplicatesToDelete.length === 0 && duplicatesToCancel.length === 0) {
    return;
  }

  console.warn(
    `[recall-recording-bot] found ${duplicatesToDelete.length + duplicatesToCancel.length} duplicate policy-managed call recording(s) for meeting ${realMeetingKey}, deleting ${duplicatesToDelete.length} and canceling ${duplicatesToCancel.length}`,
  );

  for (const callRecording of duplicatesToDelete) {
    await deleteCallRecording(client, callRecording.id);
  }

  for (const callRecording of duplicatesToCancel) {
    await cancelCallRecordingRequest({ client, callRecording });
  }
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

// The bot-carrying recording stays primary so dedupe never trades a live bot for a fresh one.
const getPolicyManagedCallRecordingsByPriority = (
  callRecordings: CallRecordingRecord[],
): CallRecordingRecord[] =>
  callRecordings
    .filter(isPolicyManagedCallRecording)
    .sort((firstCallRecording, secondCallRecording) => {
      const firstHasBot = isNonEmptyString(firstCallRecording.externalBotId);
      const secondHasBot = isNonEmptyString(secondCallRecording.externalBotId);

      if (firstHasBot !== secondHasBot) {
        return firstHasBot ? -1 : 1;
      }

      return firstCallRecording.id.localeCompare(secondCallRecording.id);
    });

const getFirstNonPolicyManagedOpenCallRecording = (
  callRecordings: CallRecordingRecord[],
): CallRecordingRecord | undefined =>
  [...callRecordings]
    .sort((firstCallRecording, secondCallRecording) =>
      firstCallRecording.id.localeCompare(secondCallRecording.id),
    )
    .find(
      (callRecording) =>
        callRecording.status !== CallRecordingStatus.COMPLETED &&
        !isPolicyManagedCallRecording(callRecording),
    );

const isPolicyManagedCallRecording = (
  callRecording: CallRecordingRecord,
): boolean =>
  isOpenRecallRecordingBotStatus(callRecording.status) &&
  (callRecording.recordingRequestStatus ===
    CallRecordingRequestStatus.REQUESTED ||
    callRecording.recordingRequestStatus ===
      CallRecordingRequestStatus.CANCELED);

const isOpenRecallRecordingBotStatus = (
  status: string | null | undefined,
): boolean =>
  status === CallRecordingStatus.SCHEDULED ||
  status === CallRecordingStatus.JOINING ||
  status === CallRecordingStatus.RECORDING ||
  status === CallRecordingStatus.PROCESSING ||
  status === CallRecordingStatus.FAILED_UNKNOWN;

const buildSkippedResult = (
  realMeetingKey: string,
): RecallRecordingBotReconciliationResult => ({
  action: 'SKIPPED',
  realMeetingKey,
  callRecordingId: null,
});
