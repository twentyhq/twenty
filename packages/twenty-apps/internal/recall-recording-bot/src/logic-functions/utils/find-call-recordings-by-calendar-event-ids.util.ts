import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const findCallRecordingsByCalendarEventIds = async (
  client: CoreApiClient,
  calendarEventIds: string[],
): Promise<CallRecordingRecord[]> => {
  if (calendarEventIds.length === 0) {
    return [];
  }

  const callRecordingNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      callRecordings: {
        __args: {
          filter: {
            calendarEventId: { in: calendarEventIds },
          },
          first: TWENTY_PAGE_SIZE,
          ...(afterCursor === undefined ? {} : { after: afterCursor }),
        },
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
            externalBotId: true,
            externalRecordingId: true,
          },
        },
      },
    });

    return queryResult.callRecordings;
  });

  return callRecordingNodes.map((callRecording) => ({
    id: callRecording.id,
    title: callRecording.title ?? null,
    status: callRecording.status ?? null,
    recordingRequestStatus: normalizeCallRecordingRequestStatus(
      callRecording.recordingRequestStatus,
    ),
    startedAt: callRecording.startedAt ?? null,
    endedAt: callRecording.endedAt ?? null,
    calendarEventId: callRecording.calendarEventId ?? null,
    externalBotId: normalizeOptionalString(callRecording.externalBotId),
    externalRecordingId: normalizeOptionalString(
      callRecording.externalRecordingId,
    ),
  }));
};

const normalizeOptionalString = (
  value: string | null | undefined,
): string | null => (isNonEmptyString(value) ? value : null);

const normalizeCallRecordingRequestStatus = (
  recordingRequestStatus: unknown,
): CallRecordingRequestStatus | null => {
  if (recordingRequestStatus === CallRecordingRequestStatus.REQUESTED) {
    return recordingRequestStatus;
  }

  if (recordingRequestStatus === CallRecordingRequestStatus.CANCELED) {
    return recordingRequestStatus;
  }

  return null;
};
