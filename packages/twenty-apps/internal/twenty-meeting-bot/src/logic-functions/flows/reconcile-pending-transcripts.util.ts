import { isNull, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { type TranscriptMarker } from 'src/logic-functions/types/transcript-marker.type';
import { buildFailedTranscriptMarker } from 'src/logic-functions/domain/build-failed-transcript-marker.util';
import { chargeCompletedCallRecording } from 'src/logic-functions/flows/charge-completed-call-recording.util';
import { downloadTranscript } from 'src/logic-functions/flows/download-transcript.util';
import { fetchAllNodes } from 'src/logic-functions/data/fetch-all-nodes.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { parseTranscriptMarker } from 'src/logic-functions/domain/parse-transcript-marker.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
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

export type ReconcilePendingTranscriptsResult = {
  pendingMarkerCount: number;
  filledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

// transcript.done webhooks get lost too; this polls stale PENDING markers.
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
        `[twenty-meeting-bot] call recording ${id} has a pending transcript marker without a transcript id; it cannot be re-checked`,
      );
      continue;
    }

    const downloadResult = await downloadTranscript({
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
        `[twenty-meeting-bot] transcript failed for call recording ${id}${isNull(downloadResult.subCode) ? '' : ` (${downloadResult.subCode})`}`,
      );
      await updateCallRecording(client, {
        id,
        data: {
          transcript: buildFailedTranscriptMarker({
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

    return queryResult.callRecordings;
  });

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
