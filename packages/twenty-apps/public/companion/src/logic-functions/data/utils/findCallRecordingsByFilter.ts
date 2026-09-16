import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/CallRecordingRequestStatus';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/TWENTY_PAGE_SIZE';
import { type CallRecordingRecord } from 'src/logic-functions/types/CallRecordingRecord';
import { fetchAllNodes } from 'src/logic-functions/data/utils/fetchAllNodes';
import { type ConnectionPage } from 'src/logic-functions/types/ConnectionPage';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalizeOptionalString';
import { isDesktopAudioRecording } from 'src/logic-functions/domain/utils/isDesktopAudioRecording';

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
  companionSession?: unknown;
  externalRecordingId?: string | null;
  companionFailureReason?: string | null;
};

export const findCallRecordingsByFilter = async (
  client: CoreApiClient,
  filter: Record<string, unknown>,
  shouldStartPageRequest: () => boolean = () => true,
): Promise<CallRecordingRecord[]> => {
  const callRecordingNodes = await fetchAllNodes<CallRecordingNode>(
    async (afterCursor) => {
      const queryResult = await client.query({
        callRecordings: {
          __args: {
            filter: { and: [filter, { companionSession: { is: 'NOT_NULL' } }] },
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
              companionSession: true,
              externalRecordingId: true,
              companionFailureReason: true,
            },
          },
        },
      });

      return queryResult.callRecordings as
        | ConnectionPage<CallRecordingNode>
        | undefined;
    },
    shouldStartPageRequest,
  );

  return callRecordingNodes
    .filter((recording) => isDesktopAudioRecording(recording.companionSession))
    .map((callRecording) => ({
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
      companionSession: callRecording.companionSession,
      externalRecordingId: normalizeOptionalString(
        callRecording.externalRecordingId,
      ),
      companionFailureReason: normalizeOptionalString(
        callRecording.companionFailureReason,
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
