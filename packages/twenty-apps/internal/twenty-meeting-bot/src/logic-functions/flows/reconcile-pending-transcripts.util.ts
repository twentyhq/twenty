import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/data/update-call-recording.util';

const PENDING_TRANSCRIPT_RECHECK_MINUTES = 60;
const PENDING_TRANSCRIPT_LOOKBACK_DAYS = 7;

type PendingTranscriptCallRecording = {
  id: string;
  marker: TranscriptMarker;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};

type PendingTranscriptCallRecordingNode = {
  id: string;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
};

export type ReconcilePendingTranscriptsResult = {
  pendingMarkerCount: number;
  filledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

export const reconcilePendingTranscripts = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ReconcilePendingTranscriptsResult> => {
  const pendingCallRecordings = await fetchPendingTranscriptCallRecordings(
    client,
    now,
  );
  const recheckCutoff = new Date(
    now.getTime() - PENDING_TRANSCRIPT_RECHECK_MINUTES * 60 * 1000,
  );

  const result: ReconcilePendingTranscriptsResult = {
    pendingMarkerCount: pendingCallRecordings.length,
    filledCallRecordingIds: [],
    failedCallRecordingIds: [],
  };

  for (const pendingCallRecording of pendingCallRecordings) {
    const { id, marker } = pendingCallRecording;

    if (
      !isUndefined(marker.requestedAt) &&
      new Date(marker.requestedAt).getTime() > recheckCutoff.getTime()
    ) {
      continue;
    }

    if (isNull(marker.recallTranscriptId)) {
      console.warn(
        `[twenty-meeting-bot] call recording ${id} has a pending transcript marker without a transcript id; marking it failed`,
      );
      await updateCallRecording(client, {
        id,
        data: {
          transcript: buildFailedTranscriptMarker({
            recallTranscriptId: null,
            subCode: 'missing_transcript_id',
          }),
          ...(isCallRecordingStatusDowngrade({
            fromStatus: pendingCallRecording.status,
            toStatus: CallRecordingStatus.FAILED_UNKNOWN,
          })
            ? {}
            : { status: CallRecordingStatus.FAILED_UNKNOWN }),
        },
      });
      result.failedCallRecordingIds.push(id);
      continue;
    }

    const downloadResult = await downloadTranscript({
      transcriptId: marker.recallTranscriptId,
    });

    if (downloadResult.outcome === 'filled') {
      const updateData: CallRecordingUpdateFields = {
        transcript: downloadResult.content as Record<string, unknown>,
      };

      await persistCallRecordingProgress(client, {
        id,
        current: pendingCallRecording,
        updateData,
      });

      result.filledCallRecordingIds.push(id);
      continue;
    }

    if (downloadResult.outcome === 'failed') {
      console.warn(
        `[twenty-meeting-bot] transcript failed for call recording ${id}${isNull(downloadResult.subCode) ? '' : ` (${downloadResult.subCode})`}`,
      );
      await updateCallRecording(client, {
        id,
        data: {
          transcript: buildFailedTranscriptMarker({
            recallTranscriptId: marker.recallTranscriptId,
            subCode: downloadResult.subCode,
          }),
          ...(isCallRecordingStatusDowngrade({
            fromStatus: pendingCallRecording.status,
            toStatus: CallRecordingStatus.FAILED_UNKNOWN,
          })
            ? {}
            : { status: CallRecordingStatus.FAILED_UNKNOWN }),
        },
      });
      result.failedCallRecordingIds.push(id);
      continue;
    }

    if (downloadResult.outcome === 'error') {
      console.warn(
        `[twenty-meeting-bot] could not re-check pending transcript for call recording ${id}: ${downloadResult.errorMessage}`,
      );
    }
  }

  return result;
};

const fetchPendingTranscriptCallRecordings = async (
  client: CoreApiClient,
  now: Date,
): Promise<PendingTranscriptCallRecording[]> => {
  const filter: Record<string, unknown> = {
    transcript: { is: 'NOT_NULL' },
    updatedAt: {
      gte: new Date(
        now.getTime() - PENDING_TRANSCRIPT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  };
  const callRecordingNodes =
    await fetchAllNodes<PendingTranscriptCallRecordingNode>(
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
                status: true,
                startedAt: true,
                endedAt: true,
                transcript: true,
                audio: { fileId: true },
                video: { fileId: true },
              },
            },
          },
        });

        return (queryResult.callRecordings ?? undefined) as
          | ConnectionPage<PendingTranscriptCallRecordingNode>
          | undefined;
      },
    );

  return callRecordingNodes.flatMap((node) => {
    const marker = parseTranscriptMarker(node.transcript);

    if (isUndefined(marker) || marker.status !== 'PENDING') {
      return [];
    }

    return [
      {
        id: node.id,
        marker,
        status: node.status ?? undefined,
        startedAt: node.startedAt ?? undefined,
        endedAt: node.endedAt ?? undefined,
        transcript: node.transcript ?? undefined,
        audio: node.audio ?? undefined,
        video: node.video ?? undefined,
      },
    ];
  });
};
