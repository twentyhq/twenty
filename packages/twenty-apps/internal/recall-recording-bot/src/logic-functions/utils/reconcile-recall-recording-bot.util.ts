import { CoreApiClient } from 'twenty-client-sdk/core';

import { type RecallRecordingBotPolicyCalendarEventInput } from 'src/logic-functions/types/recall-recording-bot-policy-calendar-event-input.type';
import { type RecallRecordingBotPolicyResultForMeeting } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-meeting.type';
import { type RecallRecordingBotReconciliationResult } from 'src/logic-functions/types/recall-recording-bot-reconciliation-result.type';
import { type RemovedRecallRecordingBotOccurrence } from 'src/logic-functions/types/removed-recall-recording-bot-occurrence.type';
import { aggregateRecallRecordingBotPolicyResultsByMeeting } from 'src/logic-functions/utils/aggregate-recall-recording-bot-policy-results-by-meeting.util';
import { buildRecallRecordingBotPolicyResult } from 'src/logic-functions/utils/build-recall-recording-bot-policy-result.util';
import { getRecallRecordingBotEnabled } from 'src/logic-functions/utils/get-recall-recording-bot-enabled.util';

const TWENTY_PAGE_SIZE = 100;

const CALL_RECORDING_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
} as const;

const CALL_RECORDING_REQUEST_STATUS = {
  REQUESTED: 'REQUESTED',
  CANCELED: 'CANCELED',
} as const;

type CallRecordingRequestStatus =
  (typeof CALL_RECORDING_REQUEST_STATUS)[keyof typeof CALL_RECORDING_REQUEST_STATUS];

type CalendarEventRecord = RecallRecordingBotPolicyCalendarEventInput & {
  title: string | null;
};

type CalendarEventParticipantRecord = {
  id: string;
  calendarEventId?: string | null;
  workspaceMemberId?: string | null;
};

type CallRecordingRecord = {
  id: string;
  title?: string | null;
  status?: string | null;
  recordingRequestStatus?: CallRecordingRequestStatus | null;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
};

type ScheduledCallRecordingFields = {
  title: string | null;
  status: typeof CALL_RECORDING_STATUS.SCHEDULED;
  recordingRequestStatus: CallRecordingRequestStatus;
  startedAt: string | null;
  endedAt: string | null;
  calendarEventId: string;
};

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
    await getRecallRecordingBotEnabled();
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

  const existingCallRecordings =
    await findCallRecordingsByCalendarEventIds(client, calendarEventIds);
  const existingPolicyManagedCallRecording = getFirstPolicyManagedCallRecording(
    existingCallRecordings,
  );
  const callRecordingFields = buildScheduledCallRecordingFields(
    representativeCalendarEvent,
  );

  if (existingPolicyManagedCallRecording !== undefined) {
    await updateCallRecording(client, {
      id: existingPolicyManagedCallRecording.id,
      data: callRecordingFields,
    });

    return {
      action: 'UPDATED',
      realMeetingKey: meetingPolicyResult.realMeetingKey,
      callRecordingId: existingPolicyManagedCallRecording.id,
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
    callRecordingFields,
  );

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
      callRecording.status === CALL_RECORDING_STATUS.SCHEDULED &&
      callRecording.recordingRequestStatus ===
        CALL_RECORDING_REQUEST_STATUS.REQUESTED,
  );

  if (cancellableCallRecordings.length === 0) {
    return buildSkippedResult(meetingPolicyResult.realMeetingKey);
  }

  for (const callRecording of cancellableCallRecordings) {
    await updateCallRecording(client, {
      id: callRecording.id,
      data: {
        recordingRequestStatus: CALL_RECORDING_REQUEST_STATUS.CANCELED,
      },
    });
  }

  return {
    action: 'CANCELED',
    realMeetingKey: meetingPolicyResult.realMeetingKey,
    callRecordingId: cancellableCallRecordings[0]?.id ?? null,
  };
};

const fetchCalendarEventsByIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueCalendarEventIds = getUniqueSortedIds(calendarEventIds);

  if (uniqueCalendarEventIds.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    id: { in: uniqueCalendarEventIds },
  });
};

const fetchCalendarEventsByStartsAtValues = async (
  client: CoreApiClient,
  startsAtValues: string[],
): Promise<CalendarEventRecord[]> => {
  const uniqueStartsAtValues = [...new Set(startsAtValues)].sort();

  if (uniqueStartsAtValues.length === 0) {
    return [];
  }

  return fetchCalendarEventsByFilter(client, {
    startsAt: { in: uniqueStartsAtValues },
  });
};

const fetchCalendarEventsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CalendarEventRecord[]> => {
  const calendarEvents: CalendarEventRecord[] = [];
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const queryArgs: Record<string, unknown> = {
      filter,
      first: TWENTY_PAGE_SIZE,
    };

    if (afterCursor !== undefined) {
      queryArgs.after = afterCursor;
    }

    const queryResult = await client.query({
      calendarEvents: {
        __args: queryArgs,
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            title: true,
            isCanceled: true,
            startsAt: true,
            endsAt: true,
            iCalUid: true,
            conferenceLink: {
              primaryLinkUrl: true,
            },
            recallRecordingBotPreference: true,
          },
        },
      },
    });
    const connection = queryResult.calendarEvents;

    for (const edge of connection?.edges ?? []) {
      const calendarEvent = edge.node;

      calendarEvents.push({
        id: calendarEvent.id,
        title: calendarEvent.title ?? null,
        isCanceled: calendarEvent.isCanceled ?? false,
        startsAt: calendarEvent.startsAt ?? null,
        endsAt: calendarEvent.endsAt ?? null,
        iCalUid: calendarEvent.iCalUid ?? null,
        conferenceLink: calendarEvent.conferenceLink ?? null,
        recallRecordingBotPreference:
          typeof calendarEvent.recallRecordingBotPreference === 'string'
            ? calendarEvent.recallRecordingBotPreference
            : null,
      });
    }

    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    afterCursor = connection?.pageInfo?.endCursor ?? undefined;

    if (afterCursor === undefined) {
      hasNextPage = false;
    }
  }

  return attachParticipantsToCalendarEvents(client, calendarEvents);
};

const attachParticipantsToCalendarEvents = async (
  client: CoreApiClient,
  calendarEvents: CalendarEventRecord[],
): Promise<CalendarEventRecord[]> => {
  const calendarEventIds = getUniqueSortedIds(
    calendarEvents.map((calendarEvent) => calendarEvent.id),
  );
  const participants = await fetchCalendarEventParticipantsByCalendarEventIds(
    client,
    calendarEventIds,
  );
  const participantsByCalendarEventId = new Map<
    string,
    CalendarEventParticipantRecord[]
  >();

  for (const participant of participants) {
    const calendarEventId = participant.calendarEventId;

    if (calendarEventId === undefined || calendarEventId === null) {
      continue;
    }

    participantsByCalendarEventId.set(calendarEventId, [
      ...(participantsByCalendarEventId.get(calendarEventId) ?? []),
      participant,
    ]);
  }

  return calendarEvents.map((calendarEvent) => ({
    ...calendarEvent,
    calendarEventParticipants:
      participantsByCalendarEventId.get(calendarEvent.id) ?? [],
  }));
};

const fetchCalendarEventParticipantsByCalendarEventIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CalendarEventParticipantRecord[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  const participants: CalendarEventParticipantRecord[] = [];
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const queryArgs: Record<string, unknown> = {
      filter: {
        calendarEventId: { in: calendarEventIds },
      },
      first: TWENTY_PAGE_SIZE,
    };

    if (afterCursor !== undefined) {
      queryArgs.after = afterCursor;
    }

    const queryResult = await client.query({
      calendarEventParticipants: {
        __args: queryArgs,
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            calendarEventId: true,
            workspaceMemberId: true,
          },
        },
      },
    });
    const connection = queryResult.calendarEventParticipants;

    for (const edge of connection?.edges ?? []) {
      participants.push(edge.node);
    }

    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    afterCursor = connection?.pageInfo?.endCursor ?? undefined;

    if (afterCursor === undefined) {
      hasNextPage = false;
    }
  }

  return participants;
};

const findCallRecordingsByCalendarEventIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CallRecordingRecord[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  const callRecordings: CallRecordingRecord[] = [];
  let hasNextPage = true;
  let afterCursor: string | undefined;

  while (hasNextPage) {
    const queryArgs: Record<string, unknown> = {
      filter: {
        calendarEventId: { in: calendarEventIds },
      },
      first: TWENTY_PAGE_SIZE,
    };

    if (afterCursor !== undefined) {
      queryArgs.after = afterCursor;
    }

    const queryResult = await client.query({
      callRecordings: {
        __args: queryArgs,
        pageInfo: {
          hasNextPage: true,
          endCursor: true,
        },
        edges: {
          node: {
            id: true,
            title: true,
            status: true,
            recordingRequestStatus: true,
            startedAt: true,
            endedAt: true,
            calendarEventId: true,
          },
        },
      },
    });
    const connection = queryResult.callRecordings;

    for (const edge of connection?.edges ?? []) {
      const callRecording = edge.node;

      callRecordings.push({
        id: callRecording.id,
        title: callRecording.title ?? null,
        status: callRecording.status ?? null,
        recordingRequestStatus: normalizeCallRecordingRequestStatus(
          callRecording.recordingRequestStatus,
        ),
        startedAt: callRecording.startedAt ?? null,
        endedAt: callRecording.endedAt ?? null,
        calendarEventId: callRecording.calendarEventId ?? null,
      });
    }

    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    afterCursor = connection?.pageInfo?.endCursor ?? undefined;

    if (afterCursor === undefined) {
      hasNextPage = false;
    }
  }

  return callRecordings;
};

const createCallRecording = async (
  client: CoreApiClient,
  data: ScheduledCallRecordingFields,
): Promise<string | null> => {
  const mutationResult = await client.mutation({
    createCallRecording: {
      __args: {
        data,
      },
      id: true,
    },
  });

  return mutationResult.createCallRecording?.id ?? null;
};

const updateCallRecording = async (
  client: CoreApiClient,
  {
    id,
    data,
  }: {
    id: string;
    data: Partial<ScheduledCallRecordingFields>;
  },
): Promise<void> => {
  await client.mutation({
    updateCallRecording: {
      __args: {
        id,
        data,
      },
      id: true,
    },
  });
};

const buildScheduledCallRecordingFields = (
  calendarEvent: CalendarEventRecord,
): ScheduledCallRecordingFields => ({
  title: calendarEvent.title,
  status: CALL_RECORDING_STATUS.SCHEDULED,
  recordingRequestStatus: CALL_RECORDING_REQUEST_STATUS.REQUESTED,
  startedAt: calendarEvent.startsAt,
  endedAt: calendarEvent.endsAt,
  calendarEventId: calendarEvent.id,
});

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

const getFirstPolicyManagedCallRecording = (
  callRecordings: CallRecordingRecord[],
): CallRecordingRecord | undefined =>
  getSortedCallRecordings(callRecordings).find(isPolicyManagedCallRecording);

const getFirstNonPolicyManagedOpenCallRecording = (
  callRecordings: CallRecordingRecord[],
): CallRecordingRecord | undefined =>
  getSortedCallRecordings(callRecordings).find(
    (callRecording) =>
      callRecording.status !== CALL_RECORDING_STATUS.COMPLETED &&
      !isPolicyManagedCallRecording(callRecording),
  );

const isPolicyManagedCallRecording = (
  callRecording: CallRecordingRecord,
): boolean =>
  callRecording.status === CALL_RECORDING_STATUS.SCHEDULED &&
  (callRecording.recordingRequestStatus ===
    CALL_RECORDING_REQUEST_STATUS.REQUESTED ||
    callRecording.recordingRequestStatus ===
      CALL_RECORDING_REQUEST_STATUS.CANCELED);

const normalizeCallRecordingRequestStatus = (
  recordingRequestStatus: unknown,
): CallRecordingRequestStatus | null => {
  if (recordingRequestStatus === CALL_RECORDING_REQUEST_STATUS.REQUESTED) {
    return recordingRequestStatus;
  }

  if (recordingRequestStatus === CALL_RECORDING_REQUEST_STATUS.CANCELED) {
    return recordingRequestStatus;
  }

  return null;
};

const getSortedCallRecordings = (
  callRecordings: CallRecordingRecord[],
): CallRecordingRecord[] =>
  [...callRecordings].sort((firstCallRecording, secondCallRecording) =>
    firstCallRecording.id.localeCompare(secondCallRecording.id),
  );

const getUniqueSortedIds = (ids: string[]): string[] =>
  [...new Set(ids)].sort((firstId, secondId) =>
    firstId.localeCompare(secondId),
  );

const buildSkippedResult = (
  realMeetingKey: string,
): RecallRecordingBotReconciliationResult => ({
  action: 'SKIPPED',
  realMeetingKey,
  callRecordingId: null,
});
