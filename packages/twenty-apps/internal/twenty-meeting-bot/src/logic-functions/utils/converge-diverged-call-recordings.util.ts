import { isNonEmptyArray } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import { chargeCompletedCallRecording } from 'src/logic-functions/utils/charge-completed-call-recording.util';
import { extractRecallBotConvergence } from 'src/logic-functions/utils/extract-recall-bot-convergence.util';
import { fetchAllNodes } from 'src/logic-functions/utils/fetch-all-nodes.util';
import { getRecallBot } from 'src/logic-functions/utils/get-recall-bot.util';
import { ingestRecallMedia } from 'src/logic-functions/utils/ingest-recall-media.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/utils/is-call-recording-status-downgrade.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { requestRecallTranscript } from 'src/logic-functions/utils/request-recall-transcript.util';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/utils/should-complete-call-recording-ingestion.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/utils/update-call-recording.util';

const CONVERGENCE_LOOKBACK_DAYS = 7;
const LIVE_MEETING_GRACE_MINUTES = 30;

const NON_TERMINAL_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

type DivergedCallRecordingCandidate = {
  id: string;
  status: string | null;
  startedAt: string | null;
  endedAt: string | null;
  externalBotId: string | null;
  externalRecordingId: string | null;
  transcript: unknown;
  audio: FilesFieldValue | null;
  video: FilesFieldValue | null;
  createdAt: string | null;
  calendarEventEndsAt: string | null;
};

export type ConvergeDivergedCallRecordingsResult = {
  candidateCount: number;
  updatedCallRecordingIds: string[];
  markedFailedCallRecordingIds: string[];
  unconvergeableCallRecordingIds: string[];
};

// Webhook deliveries get lost; this pull pass re-derives state from Recall.
export const convergeDivergedCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ConvergeDivergedCallRecordingsResult> => {
  const candidates = await fetchDivergedCallRecordingCandidates(client);
  const convergenceLowerBound = new Date(
    now.getTime() - CONVERGENCE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );
  const liveMeetingCutoff = new Date(
    now.getTime() - LIVE_MEETING_GRACE_MINUTES * 60 * 1000,
  );

  const result: ConvergeDivergedCallRecordingsResult = {
    candidateCount: candidates.length,
    updatedCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
    unconvergeableCallRecordingIds: [],
  };

  for (const candidate of candidates) {
    if (isOutsideConvergenceBound(candidate, convergenceLowerBound)) {
      console.warn(
        `[recall-recording-bot] call recording ${candidate.id} diverged but its meeting ended more than ${CONVERGENCE_LOOKBACK_DAYS} days ago; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (candidate.externalBotId === null) {
      console.warn(
        `[recall-recording-bot] call recording ${candidate.id} diverged but has no Recall bot id; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (isPossiblyStillLive(candidate, liveMeetingCutoff)) {
      continue;
    }

    await convergeCallRecording({
      client,
      candidate,
      externalBotId: candidate.externalBotId,
      now,
      result,
    });
  }

  return result;
};

const fetchDivergedCallRecordingCandidates = async (
  client: CoreApiClient,
): Promise<DivergedCallRecordingCandidate[]> => {
  // No createdAt bound: older-than-lookback candidates must surface in logs.
  const filter: Record<string, unknown> = {
    or: [
      {
        recordingRequestStatus: { eq: CallRecordingRequestStatus.REQUESTED },
        status: { in: NON_TERMINAL_CALL_RECORDING_STATUSES },
        externalBotId: { is: 'NOT_NULL' },
      },
      {
        status: { eq: CallRecordingStatus.COMPLETED },
        or: [{ startedAt: { is: 'NULL' } }, { endedAt: { is: 'NULL' } }],
      },
    ],
  };
  const candidateNodes = await fetchAllNodes(async (afterCursor) => {
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
            externalBotId: true,
            externalRecordingId: true,
            transcript: true,
            audio: { fileId: true },
            video: { fileId: true },
            createdAt: true,
            calendarEvent: {
              endsAt: true,
            },
          },
        },
      },
    });

    return queryResult.callRecordings;
  });

  return candidateNodes.map((node) => ({
    id: node.id,
    status: node.status ?? null,
    startedAt: node.startedAt ?? null,
    endedAt: node.endedAt ?? null,
    externalBotId: isNonEmptyString(node.externalBotId)
      ? node.externalBotId
      : null,
    externalRecordingId: isNonEmptyString(node.externalRecordingId)
      ? node.externalRecordingId
      : null,
    transcript: node.transcript ?? null,
    audio: node.audio ?? null,
    video: node.video ?? null,
    createdAt: node.createdAt ?? null,
    calendarEventEndsAt: node.calendarEvent?.endsAt ?? null,
  }));
};

// Anchored to meeting end: createdAt is scheduling time and can predate the meeting by weeks.
const isOutsideConvergenceBound = (
  candidate: DivergedCallRecordingCandidate,
  convergenceLowerBound: Date,
): boolean => {
  const meetingEndReference =
    candidate.calendarEventEndsAt ?? candidate.createdAt;

  return (
    meetingEndReference !== null &&
    new Date(meetingEndReference).getTime() < convergenceLowerBound.getTime()
  );
};

// Inside the grace period the meeting may still be recording; webhooks own it.
const isPossiblyStillLive = (
  candidate: DivergedCallRecordingCandidate,
  liveMeetingCutoff: Date,
): boolean =>
  candidate.status !== CallRecordingStatus.COMPLETED &&
  candidate.calendarEventEndsAt !== null &&
  new Date(candidate.calendarEventEndsAt).getTime() >
    liveMeetingCutoff.getTime();

const convergeCallRecording = async ({
  client,
  candidate,
  externalBotId,
  now,
  result,
}: {
  client: CoreApiClient;
  candidate: DivergedCallRecordingCandidate;
  externalBotId: string;
  now: Date;
  result: ConvergeDivergedCallRecordingsResult;
}): Promise<void> => {
  const botResult = await getRecallBot({ externalBotId });

  if (!botResult.ok) {
    if (botResult.status === 404) {
      await markCallRecordingFailedAfterBotLoss({
        client,
        candidate,
        externalBotId,
        result,
      });

      return;
    }

    console.warn(
      `[recall-recording-bot] failed to fetch Recall bot ${externalBotId} for call recording ${candidate.id}: ${botResult.errorMessage}`,
    );

    return;
  }

  const convergence = extractRecallBotConvergence(botResult.bot);
  const updateData: CallRecordingUpdateFields = {};

  if (
    convergence.status !== undefined &&
    convergence.status !== candidate.status &&
    !isCallRecordingStatusDowngrade({
      fromStatus: candidate.status,
      toStatus: convergence.status,
    })
  ) {
    updateData.status = convergence.status;
  }

  if (candidate.startedAt === null && convergence.startedAt !== undefined) {
    updateData.startedAt = convergence.startedAt;
  }

  if (candidate.endedAt === null && convergence.endedAt !== undefined) {
    updateData.endedAt = convergence.endedAt;
  }

  if (
    candidate.externalRecordingId === null &&
    convergence.externalRecordingId !== undefined
  ) {
    updateData.externalRecordingId = convergence.externalRecordingId;
  }

  const externalRecordingId =
    candidate.externalRecordingId ?? convergence.externalRecordingId;

  if (convergence.isRecallRecordingDone) {
    if (
      candidate.transcript === null &&
      externalRecordingId !== undefined &&
      externalRecordingId !== null
    ) {
      const transcriptMarker = await requestRecallTranscript({
        externalRecordingId,
        requestedAt: now.toISOString(),
      });

      if (transcriptMarker !== null) {
        updateData.transcript = transcriptMarker;
        updateData.externalRecordingId = externalRecordingId;
        await updateCallRecording(client, {
          id: candidate.id,
          data: { transcript: transcriptMarker, externalRecordingId },
        });
      }
    }

    Object.assign(
      updateData,
      await ingestRecallMedia({
        callRecordingId: candidate.id,
        bot: botResult.bot,
        hasAudio: isNonEmptyArray(candidate.audio),
        hasVideo: isNonEmptyArray(candidate.video),
      }),
    );
  }

  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current: candidate,
    updateData,
  });

  if (completesIngestion) {
    updateData.status = CallRecordingStatus.COMPLETED;
  }

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await updateCallRecording(client, {
    id: candidate.id,
    data: updateData,
  });

  if (completesIngestion) {
    await chargeCompletedCallRecording({
      callRecordingId: candidate.id,
      startedAt: updateData.startedAt ?? candidate.startedAt,
      endedAt: updateData.endedAt ?? candidate.endedAt,
    });
  }

  result.updatedCallRecordingIds.push(candidate.id);
};

const markCallRecordingFailedAfterBotLoss = async ({
  client,
  candidate,
  externalBotId,
  result,
}: {
  client: CoreApiClient;
  candidate: DivergedCallRecordingCandidate;
  externalBotId: string;
  result: ConvergeDivergedCallRecordingsResult;
}): Promise<void> => {
  // externalBotId is kept for audit even though the bot is gone at Recall.
  console.warn(
    `[recall-recording-bot] Recall bot ${externalBotId} for call recording ${candidate.id} no longer exists; it will not converge automatically`,
  );

  if (
    isCallRecordingStatusDowngrade({
      fromStatus: candidate.status,
      toStatus: CallRecordingStatus.FAILED_UNKNOWN,
    })
  ) {
    result.unconvergeableCallRecordingIds.push(candidate.id);

    return;
  }

  await updateCallRecording(client, {
    id: candidate.id,
    data: { status: CallRecordingStatus.FAILED_UNKNOWN },
  });
  result.markedFailedCallRecordingIds.push(candidate.id);
};
