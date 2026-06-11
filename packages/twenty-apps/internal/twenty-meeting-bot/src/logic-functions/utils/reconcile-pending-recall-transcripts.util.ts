import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type RecallTranscriptMarker } from 'src/logic-functions/types/recall-transcript-marker.type';
import { buildFailedRecallTranscriptMarker } from 'src/logic-functions/utils/build-failed-recall-transcript-marker.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/utils/charge-completed-call-recording.util';
import { downloadRecallTranscript } from 'src/logic-functions/utils/download-recall-transcript.util';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/utils/is-call-recording-status-downgrade.util';
import { parseRecallTranscriptMarker } from 'src/logic-functions/utils/parse-recall-transcript-marker.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/utils/should-complete-call-recording-ingestion.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/utils/update-call-recording.util';

const PENDING_TRANSCRIPT_RECHECK_MINUTES = 60;
const PENDING_TRANSCRIPT_LOOKBACK_DAYS = 7;

type PendingTranscriptCallRecording = {
  id: string;
  marker: RecallTranscriptMarker;
  status: string | null;
  startedAt: string | null;
  endedAt: string | null;
  transcript: unknown;
  audio: FilesFieldValue | null;
  video: FilesFieldValue | null;
};

export type ReconcilePendingRecallTranscriptsResult = {
  pendingMarkerCount: number;
  filledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

// transcript.done webhooks get lost too; this polls stale PENDING markers.
export const reconcilePendingRecallTranscripts = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ReconcilePendingRecallTranscriptsResult> => {
  const pendingCallRecordings = await fetchPendingTranscriptCallRecordings(
    client,
    now,
  );
  const recheckCutoff = new Date(
    now.getTime() - PENDING_TRANSCRIPT_RECHECK_MINUTES * 60 * 1000,
  );

  const result: ReconcilePendingRecallTranscriptsResult = {
    pendingMarkerCount: pendingCallRecordings.length,
    filledCallRecordingIds: [],
    failedCallRecordingIds: [],
  };

  for (const pendingCallRecording of pendingCallRecordings) {
    const { id, marker } = pendingCallRecording;

    if (
      marker.requestedAt !== undefined &&
      new Date(marker.requestedAt).getTime() > recheckCutoff.getTime()
    ) {
      continue;
    }

    if (marker.recallTranscriptId === null) {
      console.warn(
        `[recall-recording-bot] call recording ${id} has a pending transcript marker without a transcript id; it cannot be re-checked`,
      );
      continue;
    }

    const downloadResult = await downloadRecallTranscript({
      transcriptId: marker.recallTranscriptId,
    });

    if (downloadResult.outcome === 'filled') {
      const updateData: CallRecordingUpdateFields = {
        transcript: downloadResult.content as Record<string, unknown>,
      };
      const completesIngestion = shouldCompleteCallRecordingIngestion({
        current: pendingCallRecording,
        updateData,
      });

      if (completesIngestion) {
        updateData.status = CallRecordingStatus.COMPLETED;
      }

      await updateCallRecording(client, { id, data: updateData });

      if (completesIngestion) {
        await chargeCompletedCallRecording({
          callRecordingId: id,
          startedAt: pendingCallRecording.startedAt,
          endedAt: pendingCallRecording.endedAt,
        });
      }

      result.filledCallRecordingIds.push(id);
      continue;
    }

    if (downloadResult.outcome === 'failed') {
      console.warn(
        `[recall-recording-bot] transcript failed for call recording ${id}${downloadResult.subCode === null ? '' : ` (${downloadResult.subCode})`}`,
      );
      await updateCallRecording(client, {
        id,
        data: {
          transcript: buildFailedRecallTranscriptMarker({
            recallTranscriptId: marker.recallTranscriptId,
            subCode: downloadResult.subCode,
          }),
          // The transcript is part of the billed deliverable; its failure fails the recording.
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
        `[recall-recording-bot] could not re-check pending transcript for call recording ${id}: ${downloadResult.errorMessage}`,
      );
    }
  }

  return result;
};

const fetchPendingTranscriptCallRecordings = async (
  client: CoreApiClient,
  now: Date,
): Promise<PendingTranscriptCallRecording[]> => {
  // RAW_JSON is not filterable; detect markers in code over non-null rows.
  // updatedAt window: the marker write refreshes it, so rows created weeks before the meeting stay reachable.
  const filter: Record<string, unknown> = {
    transcript: { is: 'NOT_NULL' },
    updatedAt: {
      gte: new Date(
        now.getTime() - PENDING_TRANSCRIPT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
  };
  const callRecordingNodes = await fetchAllNodes(async (afterCursor) => {
    const queryResult = await client.query({
      callRecordings: {
        __args: {
          filter,
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

    return queryResult.callRecordings;
  });

  return callRecordingNodes.flatMap((node) => {
    const marker = parseRecallTranscriptMarker(node.transcript);

    if (marker === null || marker.status !== 'PENDING') {
      return [];
    }

    return [
      {
        id: node.id,
        marker,
        status: node.status ?? null,
        startedAt: node.startedAt ?? null,
        endedAt: node.endedAt ?? null,
        transcript: node.transcript ?? null,
        audio: node.audio ?? null,
        video: node.video ?? null,
      },
    ];
  });
};
