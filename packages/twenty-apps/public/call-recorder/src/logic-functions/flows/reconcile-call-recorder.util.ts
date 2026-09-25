import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type CallRecorderPolicyResultForMeeting } from 'src/logic-functions/types/call-recorder-policy-result-for-meeting.type';
import { type CallRecorderReconciliationResult } from 'src/logic-functions/types/call-recorder-reconciliation-result.type';
import { type RemovedCallRecorderOccurrence } from 'src/logic-functions/types/removed-call-recorder-occurrence.type';
import { aggregateCallRecorderPolicyResultsByMeeting } from 'src/logic-functions/domain/aggregate-call-recorder-policy-results-by-meeting.util';
import { buildCallRecorderPolicyResult } from 'src/logic-functions/domain/build-call-recorder-policy-result.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import { isUnavailableCallRecordingStatus } from 'src/logic-functions/domain/is-unavailable-call-recording-status.util';
import { hasCallRecordingUpdateFieldChanges } from 'src/logic-functions/domain/has-call-recording-update-field-changes.util';
import {
  createCallRecording,
  type ScheduledCallRecordingFields,
} from 'src/logic-functions/data/create-call-recording.util';
import { scheduleRecallBotForCallRecording } from 'src/logic-functions/flows/schedule-recall-bot-for-call-recording.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { fetchCalendarEventsByStartsAtValues } from 'src/logic-functions/data/fetch-calendar-events-by-starts-at-values.util';
import { clearCalendarEventsRecordingOn } from 'src/logic-functions/data/clear-calendar-events-recording-on.util';
import { markCalendarEventsRecordingOn } from 'src/logic-functions/data/mark-calendar-events-recording-on.util';
import { findCallRecordingsByCalendarEventIds } from 'src/logic-functions/data/find-call-recordings-by-calendar-event-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { rescheduleCallRecordingBot } from 'src/logic-functions/flows/reschedule-call-recording-bot.util';
import { resolveCallRecordingTitle } from 'src/logic-functions/domain/resolve-call-recording-title.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type CallRecorderMeetingPolicyResolution = {
  meetingPolicyResults: CallRecorderPolicyResultForMeeting[];
  calendarEventsById: Map<string, CalendarEventRecord>;
};

type CanceledMeetingReconciliation = {
  reconciliationResult: CallRecorderReconciliationResult;
  calendarEventIdsToClearRecordingOn: string[];
};

type ActiveMeetingReconciliation = {
  reconciliationResult: CallRecorderReconciliationResult;
  calendarEventIdsToMarkRecordingOn: string[];
};

export const reconcileCallRecorderForCalendarEventIds = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedCallRecorderOccurrence[];
  now?: Date;
}): Promise<CallRecorderReconciliationResult[]> => {
  const { meetingPolicyResults, calendarEventsById } =
    await resolveCallRecorderPolicyResultsForMeetings({
      client,
      calendarEventIds,
      removedOccurrences,
      now,
    });

  return reconcileCallRecorderForMeetingOccurrences({
    client,
    meetingPolicyResults,
    calendarEventsById,
    removedOccurrences,
  });
};

const resolveCallRecorderPolicyResultsForMeetings = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedCallRecorderOccurrence[];
  now?: Date;
}): Promise<CallRecorderMeetingPolicyResolution> => {
  const changedCalendarEvents = await fetchCalendarEventsByIds(
    client,
    getUniqueSortedIds(calendarEventIds),
  );
  const affectedMeetingKeys = new Set<string>();
  const occurrenceStartsAtAnchors = new Set<string>();
  const changedCalendarEventPolicyResults = changedCalendarEvents.map(
    (calendarEvent) => buildCallRecorderPolicyResult(calendarEvent, now),
  );

  for (const policyResult of changedCalendarEventPolicyResults) {
    affectedMeetingKeys.add(policyResult.realMeetingKey);
  }

  for (const calendarEvent of changedCalendarEvents) {
    if (!isUndefined(calendarEvent.startsAt)) {
      occurrenceStartsAtAnchors.add(calendarEvent.startsAt);
    }
  }

  for (const removedOccurrence of removedOccurrences) {
    affectedMeetingKeys.add(removedOccurrence.realMeetingKey);

    if (!isUndefined(removedOccurrence.startsAt)) {
      occurrenceStartsAtAnchors.add(removedOccurrence.startsAt);
    }
  }

  if (affectedMeetingKeys.size === 0) {
    return { meetingPolicyResults: [], calendarEventsById: new Map() };
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
      buildCallRecorderPolicyResult(calendarEvent, now),
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
      callRecorderPreference: policyResult.callRecorderPreference,
    }));
  const meetingPolicyResults = aggregateCallRecorderPolicyResultsByMeeting(
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
      calendarEventIdsWithRecordingOn: [],
    });
  }

  return {
    meetingPolicyResults,
    calendarEventsById: new Map(
      [...occurrenceSiblingEvents, ...changedCalendarEvents].map(
        (calendarEvent) => [calendarEvent.id, calendarEvent],
      ),
    ),
  };
};

const reconcileCallRecorderForMeetingOccurrences = async ({
  client,
  meetingPolicyResults,
  calendarEventsById,
  removedOccurrences = [],
}: {
  client: CoreApiClient;
  meetingPolicyResults: CallRecorderPolicyResultForMeeting[];
  calendarEventsById: Map<string, CalendarEventRecord>;
  removedOccurrences?: RemovedCallRecorderOccurrence[];
}): Promise<CallRecorderReconciliationResult[]> => {
  const removedCalendarEventIdsByMeetingKey =
    buildRemovedCalendarEventIdsByMeetingKey(removedOccurrences);
  const callRecordingsByCalendarEventId = groupCallRecordingsByCalendarEventId(
    await findCallRecordingsByCalendarEventIds(
      client,
      getUniqueSortedIds([
        ...meetingPolicyResults.flatMap(
          (meetingPolicyResult) => meetingPolicyResult.calendarEventIds,
        ),
        ...removedOccurrences.map(
          (removedOccurrence) => removedOccurrence.calendarEventId,
        ),
      ]),
    ),
  );
  const canceledMeetingReconciliations = await reconcileCanceledMeetings({
    client,
    meetingPolicyResults: meetingPolicyResults.filter(
      (meetingPolicyResult) => !meetingPolicyResult.shouldRequestBot,
    ),
    removedCalendarEventIdsByMeetingKey,
    callRecordingsByCalendarEventId,
  });

  await clearCanceledMeetingsRecordingOn(
    client,
    canceledMeetingReconciliations.flatMap(
      (canceledMeetingReconciliation) =>
        canceledMeetingReconciliation.calendarEventIdsToClearRecordingOn,
    ),
  );

  const activeMeetingReconciliations = await reconcileActiveMeetings({
    client,
    meetingPolicyResults: meetingPolicyResults.filter(
      (meetingPolicyResult) => meetingPolicyResult.shouldRequestBot,
    ),
    calendarEventsById,
    removedCalendarEventIdsByMeetingKey,
    callRecordingsByCalendarEventId,
  });

  await markActiveMeetingsRecordingOn(
    client,
    activeMeetingReconciliations.flatMap(
      (activeMeetingReconciliation) =>
        activeMeetingReconciliation.calendarEventIdsToMarkRecordingOn,
    ),
  );

  return [
    ...canceledMeetingReconciliations,
    ...activeMeetingReconciliations,
  ].map((meetingReconciliation) => meetingReconciliation.reconciliationResult);
};

const reconcileCanceledMeetings = async ({
  client,
  meetingPolicyResults,
  removedCalendarEventIdsByMeetingKey,
  callRecordingsByCalendarEventId,
}: {
  client: CoreApiClient;
  meetingPolicyResults: CallRecorderPolicyResultForMeeting[];
  removedCalendarEventIdsByMeetingKey: Map<string, string[]>;
  callRecordingsByCalendarEventId: Map<string, CallRecordingRecord[]>;
}): Promise<CanceledMeetingReconciliation[]> => {
  const callRecordingIdsCanceledInBatch = new Set<string>();
  const canceledMeetingReconciliations: CanceledMeetingReconciliation[] = [];

  for (const meetingPolicyResult of meetingPolicyResults) {
    const meetingCallRecordings = collectCanceledMeetingCallRecordings({
      calendarEventIds: [
        ...meetingPolicyResult.calendarEventIds,
        ...(removedCalendarEventIdsByMeetingKey.get(
          meetingPolicyResult.realMeetingKey,
        ) ?? []),
      ],
      callRecordingsByCalendarEventId,
      callRecordingIdsCanceledInBatch,
    });
    const cancellableCallRecordings = meetingCallRecordings.filter(
      isCancellableCallRecording,
    );

    for (const cancellableCallRecording of cancellableCallRecordings) {
      callRecordingIdsCanceledInBatch.add(cancellableCallRecording.id);
    }

    try {
      canceledMeetingReconciliations.push(
        await reconcileCanceledMeeting({
          client,
          meetingPolicyResult,
          meetingCallRecordings,
          cancellableCallRecordings,
        }),
      );
    } catch (error) {
      canceledMeetingReconciliations.push({
        reconciliationResult: buildFailedResult(
          meetingPolicyResult.realMeetingKey,
          error,
        ),
        calendarEventIdsToClearRecordingOn: [],
      });
    }
  }

  return canceledMeetingReconciliations;
};

const reconcileActiveMeetings = async ({
  client,
  meetingPolicyResults,
  calendarEventsById,
  removedCalendarEventIdsByMeetingKey,
  callRecordingsByCalendarEventId,
}: {
  client: CoreApiClient;
  meetingPolicyResults: CallRecorderPolicyResultForMeeting[];
  calendarEventsById: Map<string, CalendarEventRecord>;
  removedCalendarEventIdsByMeetingKey: Map<string, string[]>;
  callRecordingsByCalendarEventId: Map<string, CallRecordingRecord[]>;
}): Promise<ActiveMeetingReconciliation[]> => {
  const policyManagedCallRecordingsById = new Map(
    (
      await findCallRecordingsByIds(
        client,
        meetingPolicyResults.map((meetingPolicyResult) =>
          computeCallRecordingIdForMeeting(meetingPolicyResult.realMeetingKey),
        ),
      )
    ).map((callRecording) => [callRecording.id, callRecording]),
  );
  const activeMeetingReconciliations: ActiveMeetingReconciliation[] = [];

  for (const meetingPolicyResult of meetingPolicyResults) {
    try {
      activeMeetingReconciliations.push(
        await reconcileActiveMeeting({
          client,
          meetingPolicyResult,
          calendarEventsById,
          policyManagedCallRecordingsById,
          meetingCallRecordings: collectCallRecordingsForCalendarEventIds({
            calendarEventIds: [
              ...meetingPolicyResult.calendarEventIds,
              ...meetingPolicyResult.requestingCalendarEventIds,
              ...(removedCalendarEventIdsByMeetingKey.get(
                meetingPolicyResult.realMeetingKey,
              ) ?? []),
            ],
            callRecordingsByCalendarEventId,
          }),
        }),
      );
    } catch (error) {
      activeMeetingReconciliations.push({
        reconciliationResult: buildFailedResult(
          meetingPolicyResult.realMeetingKey,
          error,
        ),
        calendarEventIdsToMarkRecordingOn: [],
      });
    }
  }

  return activeMeetingReconciliations;
};

const reconcileActiveMeeting = async ({
  client,
  meetingPolicyResult,
  calendarEventsById,
  policyManagedCallRecordingsById,
  meetingCallRecordings,
}: {
  client: CoreApiClient;
  meetingPolicyResult: CallRecorderPolicyResultForMeeting;
  calendarEventsById: Map<string, CalendarEventRecord>;
  policyManagedCallRecordingsById: Map<string, CallRecordingRecord>;
  meetingCallRecordings: CallRecordingRecord[];
}): Promise<ActiveMeetingReconciliation> => {
  const representativeCalendarEventId = getUniqueSortedIds(
    meetingPolicyResult.requestingCalendarEventIds,
  )[0];

  if (isUndefined(representativeCalendarEventId)) {
    return {
      reconciliationResult: buildSkippedResult(
        meetingPolicyResult.realMeetingKey,
      ),
      calendarEventIdsToMarkRecordingOn: [],
    };
  }

  const representativeCalendarEvent = calendarEventsById.get(
    representativeCalendarEventId,
  );

  if (isUndefined(representativeCalendarEvent)) {
    return {
      reconciliationResult: buildSkippedResult(
        meetingPolicyResult.realMeetingKey,
      ),
      calendarEventIdsToMarkRecordingOn: [],
    };
  }

  const callRecordingId = computeCallRecordingIdForMeeting(
    meetingPolicyResult.realMeetingKey,
  );
  const existingCallRecording =
    policyManagedCallRecordingsById.get(callRecordingId);

  if (!isUndefined(existingCallRecording)) {
    return {
      reconciliationResult: await updatePolicyManagedCallRecording({
        client,
        existingCallRecording,
        representativeCalendarEvent,
        realMeetingKey: meetingPolicyResult.realMeetingKey,
      }),
      calendarEventIdsToMarkRecordingOn:
        getCalendarEventIdsToMarkRecordingOn(meetingPolicyResult),
    };
  }

  const manualOpenCallRecording = findManualOpenCallRecording(
    meetingCallRecordings,
  );

  if (!isUndefined(manualOpenCallRecording)) {
    return {
      reconciliationResult: {
        action: 'SKIPPED',
        realMeetingKey: meetingPolicyResult.realMeetingKey,
        callRecordingId: manualOpenCallRecording.id,
      },
      calendarEventIdsToMarkRecordingOn: [],
    };
  }

  return {
    reconciliationResult: await createPolicyManagedCallRecording({
      client,
      callRecordingId,
      representativeCalendarEvent,
      realMeetingKey: meetingPolicyResult.realMeetingKey,
    }),
    calendarEventIdsToMarkRecordingOn:
      getCalendarEventIdsToMarkRecordingOn(meetingPolicyResult),
  };
};

const getCalendarEventIdsToMarkRecordingOn = (
  meetingPolicyResult: CallRecorderPolicyResultForMeeting,
): string[] =>
  meetingPolicyResult.requestingCalendarEventIds.filter(
    (calendarEventId) =>
      !meetingPolicyResult.calendarEventIdsWithRecordingOn.includes(
        calendarEventId,
      ),
  );

const markActiveMeetingsRecordingOn = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<void> => {
  try {
    await markCalendarEventsRecordingOn(client, calendarEventIds);
  } catch (error) {
    console.warn(
      `[call-recorder] failed to mark ${calendarEventIds.length} calendar events as recording on: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
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
}): Promise<CallRecorderReconciliationResult> => {
  const updateFields = buildPolicyManagedCallRecordingUpdateFields({
    existingCallRecording,
    calendarEvent: representativeCalendarEvent,
  });

  if (
    hasCallRecordingUpdateFieldChanges({
      callRecording: existingCallRecording,
      updateFields,
    })
  ) {
    await updateCallRecording(client, {
      id: existingCallRecording.id,
      data: updateFields,
    });
  }

  await rescheduleCallRecordingBot(client, {
    callRecording: existingCallRecording,
    calendarEvent: representativeCalendarEvent,
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
}): Promise<CallRecorderReconciliationResult> => {
  const scheduledFields = buildScheduledCallRecordingFields(
    representativeCalendarEvent,
  );

  try {
    await createCallRecording(client, {
      id: callRecordingId,
      data: scheduledFields,
    });
  } catch (error) {
    // The id is deterministic, so a conflict means a concurrent run created the row first.
    const concurrentlyCreatedCallRecording = (
      await findCallRecordingsByIds(client, [callRecordingId])
    )[0];

    if (isUndefined(concurrentlyCreatedCallRecording)) {
      throw error;
    }

    return updatePolicyManagedCallRecording({
      client,
      existingCallRecording: concurrentlyCreatedCallRecording,
      representativeCalendarEvent,
      realMeetingKey,
    });
  }

  // Winning the deterministic-id insert elects this run as the single writer that creates the bot.
  const scheduleResult = await scheduleRecallBotForCallRecording(client, {
    callRecording: {
      id: callRecordingId,
      ...scheduledFields,
    },
    calendarEvent: representativeCalendarEvent,
  });

  if (
    scheduleResult.status !== 'scheduled' &&
    scheduleResult.status !== 'blocked' &&
    process.env.NODE_ENV !== 'test'
  ) {
    console.warn(
      `[call-recorder] created callRecording ${callRecordingId}, but did not schedule a Recall bot`,
    );
  }

  return {
    action: 'CREATED',
    realMeetingKey,
    callRecordingId,
  };
};

const findManualOpenCallRecording = (
  meetingCallRecordings: CallRecordingRecord[],
): CallRecordingRecord | undefined =>
  [...meetingCallRecordings]
    .sort((firstCallRecording, secondCallRecording) =>
      firstCallRecording.id.localeCompare(secondCallRecording.id),
    )
    .find(
      (callRecording) =>
        callRecording.status !== CallRecordingStatus.COMPLETED &&
        isUndefined(callRecording.recordingRequestStatus),
    );

const reconcileCanceledMeeting = async ({
  client,
  meetingPolicyResult,
  meetingCallRecordings,
  cancellableCallRecordings,
}: {
  client: CoreApiClient;
  meetingPolicyResult: CallRecorderPolicyResultForMeeting;
  meetingCallRecordings: CallRecordingRecord[];
  cancellableCallRecordings: CallRecordingRecord[];
}): Promise<CanceledMeetingReconciliation> => {
  for (const callRecording of cancellableCallRecordings) {
    await cancelCallRecordingRequest({
      client,
      callRecording,
    });
  }

  const cancellableCallRecordingIds = new Set(
    cancellableCallRecordings.map((callRecording) => callRecording.id),
  );
  const calendarEventIdsToClearRecordingOn =
    getCalendarEventIdsToClearRecordingOn({
      meetingPolicyResult,
      remainingCallRecordings: meetingCallRecordings.filter(
        (callRecording) => !cancellableCallRecordingIds.has(callRecording.id),
      ),
    });

  if (cancellableCallRecordings.length === 0) {
    return {
      reconciliationResult: buildSkippedResult(
        meetingPolicyResult.realMeetingKey,
      ),
      calendarEventIdsToClearRecordingOn,
    };
  }

  return {
    reconciliationResult: {
      action: 'CANCELED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: cancellableCallRecordings[0].id,
    },
    calendarEventIdsToClearRecordingOn,
  };
};

const getCalendarEventIdsToClearRecordingOn = ({
  meetingPolicyResult,
  remainingCallRecordings,
}: {
  meetingPolicyResult: CallRecorderPolicyResultForMeeting;
  remainingCallRecordings: CallRecordingRecord[];
}): string[] => {
  const hasCallRecordingOutsideThisCancellation = remainingCallRecordings.some(
    (callRecording) =>
      callRecording.recordingRequestStatus !==
      CallRecordingRequestStatus.CANCELED,
  );

  return hasCallRecordingOutsideThisCancellation
    ? []
    : meetingPolicyResult.calendarEventIdsWithRecordingOn;
};

const clearCanceledMeetingsRecordingOn = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<void> => {
  try {
    await clearCalendarEventsRecordingOn(client, calendarEventIds);
  } catch (error) {
    console.warn(
      `[call-recorder] failed to clear the recording preference of ${calendarEventIds.length} calendar events: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

// startedAt/endedAt come from the webhook; calendar writes never touch them.
const buildCalendarDrivenCallRecordingFields = (
  calendarEvent: CalendarEventRecord,
): Omit<ScheduledCallRecordingFields, 'status'> => ({
  title: resolveCallRecordingTitle(calendarEvent),
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
    ? {
        ...buildScheduledCallRecordingFields(calendarEvent),
        ...(isUndefined(existingCallRecording.callRecorderFailureReason)
          ? {}
          : { callRecorderFailureReason: null }),
      }
    : buildCalendarDrivenCallRecordingFields(calendarEvent);

const canResetCallRecordingStatusToScheduled = (
  status: string | undefined,
): boolean =>
  status === CallRecordingStatus.SCHEDULED ||
  isUnavailableCallRecordingStatus(status);

const buildRemovedCalendarEventIdsByMeetingKey = (
  removedOccurrences: RemovedCallRecorderOccurrence[],
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

const groupCallRecordingsByCalendarEventId = (
  callRecordings: CallRecordingRecord[],
): Map<string, CallRecordingRecord[]> => {
  const callRecordingsByCalendarEventId = new Map<
    string,
    CallRecordingRecord[]
  >();

  for (const callRecording of callRecordings) {
    if (isUndefined(callRecording.calendarEventId)) {
      continue;
    }

    callRecordingsByCalendarEventId.set(callRecording.calendarEventId, [
      ...(callRecordingsByCalendarEventId.get(callRecording.calendarEventId) ??
        []),
      callRecording,
    ]);
  }

  return callRecordingsByCalendarEventId;
};

const collectCallRecordingsForCalendarEventIds = ({
  calendarEventIds,
  callRecordingsByCalendarEventId,
}: {
  calendarEventIds: string[];
  callRecordingsByCalendarEventId: Map<string, CallRecordingRecord[]>;
}): CallRecordingRecord[] =>
  getUniqueSortedIds(calendarEventIds).flatMap(
    (calendarEventId) =>
      callRecordingsByCalendarEventId.get(calendarEventId) ?? [],
  );

const collectCanceledMeetingCallRecordings = ({
  calendarEventIds,
  callRecordingsByCalendarEventId,
  callRecordingIdsCanceledInBatch,
}: {
  calendarEventIds: string[];
  callRecordingsByCalendarEventId: Map<string, CallRecordingRecord[]>;
  callRecordingIdsCanceledInBatch: Set<string>;
}): CallRecordingRecord[] =>
  collectCallRecordingsForCalendarEventIds({
    calendarEventIds,
    callRecordingsByCalendarEventId,
  }).map((callRecording) =>
    callRecordingIdsCanceledInBatch.has(callRecording.id)
      ? {
          ...callRecording,
          recordingRequestStatus: CallRecordingRequestStatus.CANCELED,
        }
      : callRecording,
  );

const isCancellableCallRecording = (
  callRecording: CallRecordingRecord,
): boolean =>
  callRecording.status === CallRecordingStatus.SCHEDULED &&
  callRecording.recordingRequestStatus === CallRecordingRequestStatus.REQUESTED;

const buildFailedResult = (
  realMeetingKey: string,
  error: unknown,
): CallRecorderReconciliationResult => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error(
    `[call-recorder] reconciliation failed for meeting ${realMeetingKey}: ${errorMessage}`,
  );

  return {
    action: 'FAILED',
    realMeetingKey,
    errorMessage,
  };
};

const buildSkippedResult = (
  realMeetingKey: string,
): CallRecorderReconciliationResult => ({
  action: 'SKIPPED',
  realMeetingKey,
  callRecordingId: null,
});
