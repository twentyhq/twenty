import { isNonEmptyArray, isUndefined } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import {
  extractRecallBotConvergence,
  type RecallBotConvergence,
} from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { ingestCallRecordingMedia } from 'src/logic-functions/flows/ingest-call-recording-media.util';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { persistCallRecordingProgress } from 'src/logic-functions/flows/persist-call-recording-progress.util';
import { reconcileCallRecordingTranscriptArtifact } from 'src/logic-functions/flows/reconcile-call-recording-transcript-artifact.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import { shouldCompleteCallRecordingIngestion } from 'src/logic-functions/domain/should-complete-call-recording-ingestion.util';
import {
  updateCallRecording,
  type CallRecordingUpdateFields,
} from 'src/logic-functions/data/update-call-recording.util';

const CONVERGENCE_LOOKBACK_DAYS = 7;

const NON_TERMINAL_CALL_RECORDING_STATUSES = [
  CallRecordingStatus.SCHEDULED,
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

type DivergedCallRecordingCandidate = {
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalBotId: string | undefined;
  externalRecordingId: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  createdAt: string | undefined;
  calendarEventStartsAt: string | undefined;
  calendarEventEndsAt: string | undefined;
};

type DivergedCallRecordingNode = {
  id: string;
  status?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  externalBotId?: string | null;
  externalRecordingId?: string | null;
  transcript?: unknown;
  audio?: FilesFieldValue | null;
  video?: FilesFieldValue | null;
  createdAt?: string | null;
  calendarEvent?: { startsAt?: string | null; endsAt?: string | null } | null;
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
  const result: ConvergeDivergedCallRecordingsResult = {
    candidateCount: candidates.length,
    updatedCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
    requestedTranscriptCallRecordingIds: [],
    unconvergeableCallRecordingIds: [],
    skippedNotStartedCallRecordingIds: [],
  };

  for (const candidate of candidates) {
    if (isOutsideConvergenceBound(candidate, convergenceLowerBound)) {
      console.warn(
        `[twenty-meeting-bot] call recording ${candidate.id} diverged but its meeting ended more than ${CONVERGENCE_LOOKBACK_DAYS} days ago; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (isUndefined(candidate.externalBotId)) {
      console.warn(
        `[twenty-meeting-bot] call recording ${candidate.id} diverged but has no Recall bot id; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (isBeforeMeetingStart(candidate, now)) {
      result.skippedNotStartedCallRecordingIds.push(candidate.id);
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
  const candidateNodes = await fetchAllNodes<DivergedCallRecordingNode>(
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
              externalBotId: true,
              externalRecordingId: true,
              transcript: true,
              audio: { fileId: true },
              video: { fileId: true },
              createdAt: true,
              calendarEvent: {
                startsAt: true,
                endsAt: true,
              },
            },
          },
        },
      });

      return (queryResult.callRecordings ?? undefined) as
        | ConnectionPage<DivergedCallRecordingNode>
        | undefined;
    },
  );

  return candidateNodes.map((node) => ({
    id: node.id,
    status: node.status ?? undefined,
    startedAt: node.startedAt ?? undefined,
    endedAt: node.endedAt ?? undefined,
    externalBotId: isNonEmptyString(node.externalBotId)
      ? node.externalBotId
      : undefined,
    externalRecordingId: isNonEmptyString(node.externalRecordingId)
      ? node.externalRecordingId
      : undefined,
    transcript: node.transcript ?? undefined,
    audio: node.audio ?? undefined,
    video: node.video ?? undefined,
    createdAt: node.createdAt ?? undefined,
    calendarEventStartsAt: node.calendarEvent?.startsAt ?? undefined,
    calendarEventEndsAt: node.calendarEvent?.endsAt ?? undefined,
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
    !isUndefined(meetingEndReference) &&
    new Date(meetingEndReference).getTime() < convergenceLowerBound.getTime()
  );
};

// Until the meeting starts the bot has recorded nothing, so there is nothing to pull yet.
const isBeforeMeetingStart = (
  candidate: DivergedCallRecordingCandidate,
  now: Date,
): boolean =>
  !isUndefined(candidate.calendarEventStartsAt) &&
  new Date(candidate.calendarEventStartsAt).getTime() > now.getTime();

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
      `[twenty-meeting-bot] failed to fetch Recall bot ${externalBotId} for call recording ${candidate.id}: ${botResult.errorMessage}`,
    );

    return;
  }

  const convergence = extractRecallBotConvergence(botResult.bot);
  const updateData = buildConvergenceFieldUpdates({ candidate, convergence });

  const externalRecordingId =
    candidate.externalRecordingId ?? convergence.externalRecordingId;

  if (convergence.isRecallRecordingDone && !isUndefined(externalRecordingId)) {
    const transcriptArtifactResult =
      await reconcileCallRecordingTranscriptArtifact({
        callRecordingId: candidate.id,
        currentStatus: candidate.status,
        externalRecordingId,
        requestedAt: now.toISOString(),
        transcript: candidate.transcript,
      });

    Object.assign(updateData, transcriptArtifactResult.updateData);

    if (transcriptArtifactResult.requestedTranscript) {
      result.requestedTranscriptCallRecordingIds.push(candidate.id);
    }

    Object.assign(
      updateData,
      await ingestCallRecordingMedia({
        callRecordingId: candidate.id,
        externalRecordingId,
        hasAudio: isNonEmptyArray(candidate.audio),
        hasVideo: isNonEmptyArray(candidate.video),
      }),
    );
  }

  const completesIngestion = shouldCompleteCallRecordingIngestion({
    current: candidate,
    updateData,
  });

  if (Object.keys(updateData).length === 0 && !completesIngestion) {
    return;
  }

  await persistCallRecordingProgress(client, {
    id: candidate.id,
    current: candidate,
    updateData,
  });

  result.updatedCallRecordingIds.push(candidate.id);
};

// Pure merge: fill only unset candidate fields and never downgrade status.
const buildConvergenceFieldUpdates = ({
  candidate,
  convergence,
}: {
  candidate: DivergedCallRecordingCandidate;
  convergence: RecallBotConvergence;
}): CallRecordingUpdateFields => {
  const updateData: CallRecordingUpdateFields = {};

  if (
    !isUndefined(convergence.status) &&
    convergence.status !== candidate.status &&
    !isCallRecordingStatusDowngrade({
      fromStatus: candidate.status,
      toStatus: convergence.status,
    })
  ) {
    updateData.status = convergence.status;
  }

  if (isUndefined(candidate.startedAt) && !isUndefined(convergence.startedAt)) {
    updateData.startedAt = convergence.startedAt;
  }

  if (isUndefined(candidate.endedAt) && !isUndefined(convergence.endedAt)) {
    updateData.endedAt = convergence.endedAt;
  }

  if (
    isUndefined(candidate.externalRecordingId) &&
    !isUndefined(convergence.externalRecordingId)
  ) {
    updateData.externalRecordingId = convergence.externalRecordingId;
  }

  return updateData;
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
    `[twenty-meeting-bot] Recall bot ${externalBotId} for call recording ${candidate.id} no longer exists; it will not converge automatically`,
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
