import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { NON_TERMINAL_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/non-terminal-call-recording-statuses';
import { TWENTY_PAGE_SIZE } from 'src/logic-functions/constants/twenty-page-size';
import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';
import {
  fetchAllNodes,
  type ConnectionPage,
} from 'src/logic-functions/data/fetch-all-nodes.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import {
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import { type ConvergeDivergedCallRecordingsResult } from 'src/logic-functions/flows/converge-diverged-call-recordings-result.type';
import {
  syncCallRecording,
  type SyncableCallRecording,
} from 'src/logic-functions/flows/sync-call-recording.util';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

const CONVERGENCE_LOOKBACK_DAYS = 7;
const CONVERGENCE_BOT_LIST_LOOKBACK_DAYS = CONVERGENCE_LOOKBACK_DAYS + 1;
const CONVERGENCE_BOT_LIST_LOOKAHEAD_MILLISECONDS = 60 * 60 * 1000;
const PER_RECORDING_FALLBACK_LIMIT = 25;
const FALLBACK_ROTATION_INTERVAL_MILLISECONDS = 15 * 60 * 1000;

type DivergedCallRecordingCandidate = SyncableCallRecording & {
  externalBotId: string | undefined;
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
  callRecorderFailureReason?: string | null;
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
  const actionableCandidates: Array<
    DivergedCallRecordingCandidate & { externalBotId: string }
  > = [];

  for (const candidate of candidates) {
    if (isOutsideConvergenceBound(candidate, convergenceLowerBound)) {
      console.warn(
        `[call-recorder] call recording ${candidate.id} diverged but its meeting ended more than ${CONVERGENCE_LOOKBACK_DAYS} days ago; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (isUndefined(candidate.externalBotId)) {
      console.warn(
        `[call-recorder] call recording ${candidate.id} diverged but has no Recall bot id; it will not converge automatically`,
      );
      result.unconvergeableCallRecordingIds.push(candidate.id);
      continue;
    }

    if (isBeforeMeetingStart(candidate, now)) {
      result.skippedNotStartedCallRecordingIds.push(candidate.id);
      continue;
    }

    actionableCandidates.push({
      ...candidate,
      externalBotId: candidate.externalBotId,
    });
  }

  if (actionableCandidates.length === 0) {
    return result;
  }

  const listedRecallBotsById = await listRecallBotsByIdForConvergence(now);

  // A failed list means Recall is degraded; avoid fanning out per-recording reads while the provider asks for less load.
  if (isUndefined(listedRecallBotsById)) {
    return result;
  }

  // Only unlisted candidates spend the per-recording fallback budget, so rotate
  // them across runs and keep already-listed candidates (which converge for free) last.
  const orderedActionableCandidates = [
    ...rotateActionableCandidatesForFallback({
      candidates: actionableCandidates.filter(
        (candidate) => !listedRecallBotsById.has(candidate.externalBotId),
      ),
      now,
    }),
    ...actionableCandidates.filter((candidate) =>
      listedRecallBotsById.has(candidate.externalBotId),
    ),
  ];
  let remainingPerRecordingFallbackCount = PER_RECORDING_FALLBACK_LIMIT;

  for (const candidate of orderedActionableCandidates) {
    const listedBot = listedRecallBotsById.get(candidate.externalBotId);

    if (
      isUndefined(listedBot) &&
      remainingPerRecordingFallbackCount === 0
    ) {
      console.warn(
        `[call-recorder] skipping Recall bot ${candidate.externalBotId} for call recording ${candidate.id}: per-recording convergence fallback budget exhausted`,
      );

      continue;
    }

    if (isUndefined(listedBot)) {
      remainingPerRecordingFallbackCount -= 1;
    }

    await convergeCallRecording({
      client,
      candidate,
      externalBotId: candidate.externalBotId,
      listedBot,
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
              callRecorderFailureReason: true,
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
    callRecorderFailureReason: isNonEmptyString(node.callRecorderFailureReason)
      ? node.callRecorderFailureReason
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
    candidate.calendarEventEndsAt ??
    candidate.endedAt ??
    candidate.calendarEventStartsAt ??
    candidate.startedAt ??
    candidate.createdAt;

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
  listedBot,
  now,
  result,
}: {
  client: CoreApiClient;
  candidate: DivergedCallRecordingCandidate;
  externalBotId: string;
  listedBot: RecallBotSnapshot | undefined;
  now: Date;
  result: ConvergeDivergedCallRecordingsResult;
}): Promise<void> => {
  const botResult = isUndefined(listedBot)
    ? await getRecallBot({ externalBotId })
    : ({ ok: true, bot: listedBot } as const);

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
      `[call-recorder] failed to fetch Recall bot ${externalBotId} for call recording ${candidate.id}: ${botResult.errorMessage}`,
    );

    return;
  }

  const syncResult = await syncCallRecording({
    client,
    callRecording: candidate,
    bot: botResult.bot,
    treatRecordingAsDone: false,
    requestedAt: now.toISOString(),
  });

  if (syncResult.updated) {
    result.updatedCallRecordingIds.push(candidate.id);
  }

  if (syncResult.requestedTranscript) {
    result.requestedTranscriptCallRecordingIds.push(candidate.id);
  }
};

const rotateActionableCandidatesForFallback = <
  Candidate extends { externalBotId: string },
>({
  candidates,
  now,
}: {
  candidates: Candidate[];
  now: Date;
}): Candidate[] => {
  if (candidates.length <= PER_RECORDING_FALLBACK_LIMIT) {
    return candidates;
  }

  const completedRotationIntervalCount = Math.floor(
    now.getTime() / FALLBACK_ROTATION_INTERVAL_MILLISECONDS,
  );
  const rotationOffset =
    (completedRotationIntervalCount * PER_RECORDING_FALLBACK_LIMIT) %
    candidates.length;

  return [
    ...candidates.slice(rotationOffset),
    ...candidates.slice(0, rotationOffset),
  ];
};

const listRecallBotsByIdForConvergence = async (
  now: Date,
): Promise<Map<string, RecallBotSnapshot> | undefined> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    console.warn(
      '[call-recorder] workspace id unavailable for Recall bot list fetch; using capped per-recording convergence fallback',
    );

    return new Map();
  }

  const listResult = await listScheduledRecallBots({
    joinAtAfter: new Date(
      now.getTime() -
        CONVERGENCE_BOT_LIST_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
    joinAtBefore: new Date(
      now.getTime() + CONVERGENCE_BOT_LIST_LOOKAHEAD_MILLISECONDS,
    ).toISOString(),
    metadata: { twentyWorkspaceId: currentWorkspaceId },
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] Recall bot list fetch failed; deferring stale recording convergence to the next run: ${listResult.errorMessage}`,
    );

    return undefined;
  }

  return new Map(
    listResult.bots
      .filter((bot) =>
        isCurrentWorkspaceManagedBot({ bot, currentWorkspaceId }),
      )
      .map((bot) => [bot.id, bot]),
  );
};

const isCurrentWorkspaceManagedBot = ({
  bot,
  currentWorkspaceId,
}: {
  bot: RecallScheduledBot;
  currentWorkspaceId: string;
}): boolean => {
  const claimedWorkspaceId = bot.metadata.twentyWorkspaceId;

  return (
    isNonEmptyString(claimedWorkspaceId) &&
    claimedWorkspaceId.trim() === currentWorkspaceId
  );
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
    `[call-recorder] Recall bot ${externalBotId} for call recording ${candidate.id} no longer exists; it will not converge automatically`,
  );

  if (
    isCallRecordingStatusDowngrade({
      fromStatus: candidate.status,
      toStatus: CallRecordingStatus.FAILED,
    })
  ) {
    result.unconvergeableCallRecordingIds.push(candidate.id);

    return;
  }

  await updateCallRecording(client, {
    id: candidate.id,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: 'recall_bot_not_found',
    },
  });
  result.markedFailedCallRecordingIds.push(candidate.id);
};
