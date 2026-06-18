import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { type CalendarEventRecord } from 'src/logic-functions/types/calendar-event-record.type';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type MeetingBotPolicyResultForMeeting } from 'src/logic-functions/types/meeting-bot-policy-result-for-meeting.type';
import { type MeetingBotReconciliationResult } from 'src/logic-functions/types/meeting-bot-reconciliation-result.type';
import { type RemovedMeetingBotOccurrence } from 'src/logic-functions/types/removed-meeting-bot-occurrence.type';
import { aggregateMeetingBotPolicyResultsByMeeting } from 'src/logic-functions/domain/aggregate-meeting-bot-policy-results-by-meeting.util';
import { buildMeetingBotPolicyResult } from 'src/logic-functions/domain/build-meeting-bot-policy-result.util';
import { cancelCallRecordingRequest } from 'src/logic-functions/flows/cancel-call-recording-request.util';
import { computeCallRecordingIdForMeeting } from 'src/logic-functions/domain/compute-call-recording-id-for-meeting.util';
import {
  createCallRecording,
  type ScheduledCallRecordingFields,
} from 'src/logic-functions/data/create-call-recording.util';
import { ensureMeetingBot } from 'src/logic-functions/flows/ensure-meeting-bot.util';
import { fetchCalendarEventsByIds } from 'src/logic-functions/data/fetch-calendar-events-by-ids.util';
import { fetchCalendarEventsByStartsAtValues } from 'src/logic-functions/data/fetch-calendar-events-by-starts-at-values.util';
import { findCallRecordingsByCalendarEventIds } from 'src/logic-functions/data/find-call-recordings-by-calendar-event-ids.util';
import { findCallRecordingsByIds } from 'src/logic-functions/data/find-call-recordings-by-ids.util';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { rescheduleCallRecordingBot } from 'src/logic-functions/flows/reschedule-call-recording-bot.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/data/update-call-recording.util';

export const reconcileMeetingBotForCalendarEventIds = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedMeetingBotOccurrence[];
  now?: Date;
}): Promise<MeetingBotReconciliationResult[]> => {
  const meetingPolicyResults = await resolveMeetingBotPolicyResultsForMeetings({
    client,
    calendarEventIds,
    removedOccurrences,
    now,
  });

  return reconcileMeetingBotForMeetingOccurrences({
    client,
    meetingPolicyResults,
    removedOccurrences,
  });
};

const resolveMeetingBotPolicyResultsForMeetings = async ({
  client,
  calendarEventIds,
  removedOccurrences = [],
  now = new Date(),
}: {
  client: CoreApiClient;
  calendarEventIds: string[];
  removedOccurrences?: RemovedMeetingBotOccurrence[];
  now?: Date;
}): Promise<MeetingBotPolicyResultForMeeting[]> => {
  const changedCalendarEvents = await fetchCalendarEventsByIds(
    client,
    getUniqueSortedIds(calendarEventIds),
  );
  const affectedMeetingKeys = new Set<string>();
  const occurrenceStartsAtAnchors = new Set<string>();
  const changedCalendarEventPolicyResults = changedCalendarEvents.map(
    (calendarEvent) => buildMeetingBotPolicyResult(calendarEvent, now),
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
      buildMeetingBotPolicyResult(calendarEvent, now),
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
  const meetingPolicyResults = aggregateMeetingBotPolicyResultsByMeeting(
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

const reconcileMeetingBotForMeetingOccurrences = async ({
  client,
  meetingPolicyResults,
  removedOccurrences = [],
}: {
  client: CoreApiClient;
  meetingPolicyResults: MeetingBotPolicyResultForMeeting[];
  removedOccurrences?: RemovedMeetingBotOccurrence[];
}): Promise<MeetingBotReconciliationResult[]> => {
  const removedCalendarEventIdsByMeetingKey =
    buildRemovedCalendarEventIdsByMeetingKey(removedOccurrences);
  const reconciliationResults: MeetingBotReconciliationResult[] = [];
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
        `[twenty-meeting-bot] reconciliation failed for meeting ${meetingPolicyResult.realMeetingKey}: ${errorMessage}`,
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
  meetingPolicyResult: MeetingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
}): Promise<MeetingBotReconciliationResult> => {
  const representativeCalendarEventId = getUniqueSortedIds(
    meetingPolicyResult.requestingCalendarEventIds,
  )[0];

  if (isUndefined(representativeCalendarEventId)) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  const representativeCalendarEvent = (
    await fetchCalendarEventsByIds(client, [representativeCalendarEventId])
  )[0];

  if (isUndefined(representativeCalendarEvent)) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  const callRecordingId = computeCallRecordingIdForMeeting(
    meetingPolicyResult.realMeetingKey,
  );
  const existingCallRecording = (
    await findCallRecordingsByIds(client, [callRecordingId])
  )[0];

  if (!isUndefined(existingCallRecording)) {
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

  if (!isUndefined(manualOpenCallRecording)) {
    return {
      action: 'SKIPPED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: manualOpenCallRecording.id,
    };
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
}): Promise<MeetingBotReconciliationResult> => {
  await updateCallRecording(client, {
    id: existingCallRecording.id,
    data: buildPolicyManagedCallRecordingUpdateFields({
      existingCallRecording,
      calendarEvent: representativeCalendarEvent,
    }),
  });
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
}): Promise<MeetingBotReconciliationResult> => {
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
  await ensureMeetingBot(client, {
    callRecording: {
      id: callRecordingId,
      ...scheduledFields,
      title: scheduledFields.title ?? undefined,
    },
    calendarEvent: representativeCalendarEvent,
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
  meetingPolicyResult: MeetingBotPolicyResultForMeeting;
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
        isUndefined(callRecording.recordingRequestStatus),
    );
};

const reconcileCanceledMeeting = async ({
  client,
  meetingPolicyResult,
  removedCalendarEventIds,
}: {
  client: CoreApiClient;
  meetingPolicyResult: MeetingBotPolicyResultForMeeting;
  removedCalendarEventIds: string[];
}): Promise<MeetingBotReconciliationResult> => {
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
  // Wire null clears a stale title when the calendar title is gone or restricted.
  title: calendarEvent.title ?? null,
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
  status: string | undefined,
): boolean =>
  status === CallRecordingStatus.SCHEDULED ||
  status === CallRecordingStatus.FAILED_UNKNOWN;

const buildRemovedCalendarEventIdsByMeetingKey = (
  removedOccurrences: RemovedMeetingBotOccurrence[],
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
): MeetingBotReconciliationResult => ({
  action: 'SKIPPED',
  realMeetingKey,
  callRecordingId: null,
});
