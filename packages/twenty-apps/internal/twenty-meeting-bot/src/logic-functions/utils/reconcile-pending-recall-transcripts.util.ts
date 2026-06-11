import { CoreApiClient } from 'twenty-client-sdk/core';

import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { downloadRecallTranscript } from 'src/logic-functions/utils/download-recall-transcript.util';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import {
  buildFailedRecallTranscriptMarker,
  parseRecallTranscriptMarker,
  type RecallTranscriptMarker,
} from 'src/logic-functions/utils/recall-transcript-marker.util';
import { updateCallRecording } from 'src/logic-functions/utils/update-call-recording.util';

const PENDING_TRANSCRIPT_RECHECK_MINUTES = 60;
const PENDING_TRANSCRIPT_LOOKBACK_DAYS = 7;

type PendingTranscriptCallRecording = {
  id: string;
  marker: RecallTranscriptMarker;
};

export type ReconcilePendingRecallTranscriptsResult = {
  pendingMarkerCount: number;
  filledCallRecordingIds: string[];
  failedCallRecordingIds: string[];
};

// transcript.done webhooks get lost like any other delivery; this phase polls
// Recall for PENDING markers that stayed unresolved past the re-check delay.
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

  for (const { id, marker } of pendingCallRecordings) {
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
      await updateCallRecording(client, {
        id,
        data: {
          transcript: downloadResult.content as Record<string, unknown>,
        },
      });
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
  // RAW_JSON content is not filterable; fetch recent non-null transcripts and
  // detect markers in code.
  const filter: Record<string, unknown> = {
    transcript: { is: 'NOT_NULL' },
    createdAt: {
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
            transcript: true,
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

    return [{ id: node.id, marker }];
  });
};
