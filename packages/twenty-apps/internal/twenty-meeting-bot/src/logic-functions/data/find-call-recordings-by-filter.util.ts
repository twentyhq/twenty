import { isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

type CallRecordingNode = {
  id: string;
  title?: string | null;
  status?: string | null;
  recordingRequestStatus?: unknown;
  startedAt?: string | null;
  endedAt?: string | null;
  calendarEventId?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
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
              startedAt: true,
              endedAt: true,
              calendarEventId: true,
              externalBotId: true,
              externalRecordingId: true,
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
    startedAt: callRecording.startedAt ?? undefined,
    endedAt: callRecording.endedAt ?? undefined,
    calendarEventId: callRecording.calendarEventId ?? undefined,
    externalBotId: normalizeOptionalString(callRecording.externalBotId),
    externalRecordingId: normalizeOptionalString(
      callRecording.externalRecordingId,
    ),
  }));
};

const normalizeOptionalString = (
  value: string | null | undefined,
): string | undefined => (isNonEmptyString(value) ? value : undefined);

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
