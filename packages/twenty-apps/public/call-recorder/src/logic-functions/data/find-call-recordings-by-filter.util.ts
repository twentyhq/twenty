import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

type CallRecordingNode = {
  id: string;
  title?: string | null;
  status?: string | null;
  recordingRequestStatus?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
  botScheduleAttemptedAt?: string | null;
  botScheduleIdempotencyKey?: string | null;
  externalRecordingId?: string | null;
  callRecorderFailureReason?: string | null;
};

export const findCallRecordingsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
): Promise<CallRecordingRecord[]> => {
  const callRecordingNodes = await fetchAllNodes<CallRecordingNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter,
            first: TWENTY_PAGE_SIZE,
            ...(isUndefined(afterCursor) ? {} : { after: afterCursor }),
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
              createdAt: true,
              updatedAt: true,
              startedAt: true,
              endedAt: true,
              calendarEventId: true,
              externalBotId: true,
              botScheduleAttemptedAt: true,
              botScheduleIdempotencyKey: true,
              externalRecordingId: true,
              callRecorderFailureReason: true,
            },
          },
        },
      });

      return queryResult.callRecordings as
        | ConnectionPage<CallRecordingNode>
        | undefined;
    },
  );

  return callRecordingNodes.map((callRecording) => ({
    id: callRecording.id,
    title: callRecording.title ?? undefined,
    status: callRecording.status ?? undefined,
    recordingRequestStatus: normalizeCallRecordingRequestStatus(
      callRecording.recordingRequestStatus,
    ),
    createdAt: callRecording.createdAt ?? undefined,
    updatedAt: callRecording.updatedAt ?? undefined,
    startedAt: callRecording.startedAt ?? undefined,
    endedAt: callRecording.endedAt ?? undefined,
    calendarEventId: callRecording.calendarEventId ?? undefined,
    externalBotId: normalizeOptionalString(callRecording.externalBotId),
    botScheduleAttemptedAt: normalizeOptionalString(
      callRecording.botScheduleAttemptedAt,
    ),
    botScheduleIdempotencyKey: normalizeOptionalString(
      callRecording.botScheduleIdempotencyKey,
    ),
    externalRecordingId: normalizeOptionalString(
      callRecording.externalRecordingId,
    ),
    callRecorderFailureReason: normalizeOptionalString(
      callRecording.callRecorderFailureReason,
    ),
  }));
};

const normalizeCallRecordingRequestStatus = (
  recordingRequestStatus: unknown,
): CallRecordingRequestStatus | undefined => {
  if (recordingRequestStatus === CallRecordingRequestStatus.REQUESTED) {
    return recordingRequestStatus;
  }

  if (recordingRequestStatus === CallRecordingRequestStatus.CANCELED) {
    return recordingRequestStatus;
  }

  return undefined;
};
