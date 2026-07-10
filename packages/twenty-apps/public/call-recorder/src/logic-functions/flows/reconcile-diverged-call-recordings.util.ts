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
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { getRecallBot } from 'src/logic-functions/recall-api/get-recall-bot.util';
import {
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/is-call-recording-status-downgrade.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';
import {
  reconcileCallRecording,
  type ReconcilableCallRecording,
} from 'src/logic-functions/flows/reconcile-call-recording.util';
import { type ReconcileDivergedCallRecordingsResult } from 'src/logic-functions/flows/reconcile-diverged-call-recordings-result.type';
import { updateCallRecording } from 'src/logic-functions/data/update-call-recording.util';

const CONVERGENCE_LOOKBACK_DAYS = 7;
// One extra day so a bot whose join time precedes its meeting-end anchor still lists.
const CONVERGENCE_BOT_LIST_LOOKBACK_DAYS = CONVERGENCE_LOOKBACK_DAYS + 1;
const CONVERGENCE_BOT_LIST_LOOKAHEAD_MS = 60 * 60 * 1000;
const CONVERGENCE_PER_ID_FALLBACK_LIMIT = 25;
const CONVERGENCE_PER_ID_FALLBACK_ROTATION_INTERVAL_MS = 15 * 60 * 1000;

type DivergedCallRecordingCandidate = ReconcilableCallRecording & {
  externalBotId: string | undefined;
  createdAt: string | undefined;
  calendarEventStartsAt: string | undefined;
  calendarEventEndsAt: string | undefined;
};

type ActionableCallRecordingCandidate = DivergedCallRecordingCandidate & {
  externalBotId: string;
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

type ConvergenceCandidateTriage = {
  actionableCandidates: ActionableCallRecordingCandidate[];
  unconvergeableCallRecordingIds: string[];
  skippedNotStartedCallRecordingIds: string[];
};

type ReconcileActionableCandidateOutcome =
  | { outcome: 'reconciled'; updated: boolean; requestedTranscript: boolean }
  | { outcome: 'marked-failed-after-bot-loss' }
  | { outcome: 'unconvergeable-after-bot-loss' }
  | { outcome: 'bot-state-unavailable' };

export const reconcileDivergedCallRecordings = async ({
  client,
  now,
}: {
  client: CoreApiClient;
  now: Date;
}): Promise<ReconcileDivergedCallRecordingsResult> => {
  const candidates = await fetchDivergedCallRecordingCandidates(client);
  const triage = triageConvergenceCandidates({ candidates, now });
  const result: ReconcileDivergedCallRecordingsResult = {
    candidateCount: candidates.length,
    updatedCallRecordingIds: [],
    markedFailedCallRecordingIds: [],
    requestedTranscriptCallRecordingIds: [],
    unconvergeableCallRecordingIds: triage.unconvergeableCallRecordingIds,
    skippedNotStartedCallRecordingIds: triage.skippedNotStartedCallRecordingIds,
  };

  if (triage.actionableCandidates.length === 0) {
    return result;
  }

  const listedBotsById = await listConvergenceBotsById(now);

  // A failed list means Recall is degraded; fanning out per-id reads would add load exactly when the provider asks for less.
  if (isUndefined(listedBotsById)) {
    return result;
  }

  const orderedActionableCandidates = rotateActionableCandidatesForFallback({
    candidates: triage.actionableCandidates,
    now,
  });
  let remainingPerIdFallbackCount = CONVERGENCE_PER_ID_FALLBACK_LIMIT;

  for (const candidate of orderedActionableCandidates) {
    const listedBot = listedBotsById.get(candidate.externalBotId);

    if (isUndefined(listedBot) && remainingPerIdFallbackCount === 0) {
      console.warn(
        `[call-recorder] skipping Recall bot ${candidate.externalBotId} for call recording ${candidate.id}: per-id convergence fallback budget exhausted`,
      );

      continue;
    }

    if (isUndefined(listedBot)) {
      remainingPerIdFallbackCount -= 1;
    }

    const candidateOutcome = await reconcileActionableCandidate({
      client,
      candidate,
      listedBot,
      now,
    });

    if (candidateOutcome.outcome === 'reconciled') {
      if (candidateOutcome.updated) {
        result.updatedCallRecordingIds.push(candidate.id);
      }

      if (candidateOutcome.requestedTranscript) {
        result.requestedTranscriptCallRecordingIds.push(candidate.id);
      }
    }

    if (candidateOutcome.outcome === 'marked-failed-after-bot-loss') {
      result.markedFailedCallRecordingIds.push(candidate.id);
    }

    if (candidateOutcome.outcome === 'unconvergeable-after-bot-loss') {
      result.unconvergeableCallRecordingIds.push(candidate.id);
    }
  }

  return result;
};

const triageConvergenceCandidates = ({
  candidates,
  now,
}: {
  candidates: DivergedCallRecordingCandidate[];
  now: Date;
}): ConvergenceCandidateTriage => {
  const convergenceLowerBound = new Date(
    now.getTime() - CONVERGENCE_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
  );
  const triage: ConvergenceCandidateTriage = {
    actionableCandidates: [],
    unconvergeableCallRecordingIds: [],
    skippedNotStartedCallRecordingIds: [],
  };

  for (const candidate of candidates) {
    if (isOutsideConvergenceBound(candidate, convergenceLowerBound)) {
      console.warn(
        `[call-recorder] call recording ${candidate.id} diverged but its meeting ended more than ${CONVERGENCE_LOOKBACK_DAYS} days ago; it will not converge automatically`,
      );
      triage.unconvergeableCallRecordingIds.push(candidate.id);

      continue;
    }

    if (isUndefined(candidate.externalBotId)) {
      console.warn(
        `[call-recorder] call recording ${candidate.id} diverged but has no Recall bot id; it will not converge automatically`,
      );
      triage.unconvergeableCallRecordingIds.push(candidate.id);

      continue;
    }

    if (isBeforeMeetingStart(candidate, now)) {
      triage.skippedNotStartedCallRecordingIds.push(candidate.id);

      continue;
    }

    triage.actionableCandidates.push({
      ...candidate,
      externalBotId: candidate.externalBotId,
    });
  }

  return triage;
};

const reconcileActionableCandidate = async ({
  client,
  candidate,
  listedBot,
  now,
}: {
  client: CoreApiClient;
  candidate: ActionableCallRecordingCandidate;
  listedBot: RecallBotSnapshot | undefined;
  now: Date;
}): Promise<ReconcileActionableCandidateOutcome> => {
  const botResult = isUndefined(listedBot)
    ? await getRecallBot({ externalBotId: candidate.externalBotId })
    : ({ ok: true, bot: listedBot } as const);

  if (!botResult.ok) {
    if (botResult.status === 404) {
      return markCallRecordingFailedAfterBotLoss({ client, candidate });
    }

    console.warn(
      `[call-recorder] failed to fetch Recall bot ${candidate.externalBotId} for call recording ${candidate.id}: ${botResult.errorMessage}`,
    );

    return { outcome: 'bot-state-unavailable' };
  }

  const reconcileResult = await reconcileCallRecording({
    client,
    callRecording: candidate,
    bot: botResult.bot,
    treatRecordingAsDone: false,
    requestedAt: now.toISOString(),
  });

  return { outcome: 'reconciled', ...reconcileResult };
};

const markCallRecordingFailedAfterBotLoss = async ({
  client,
  candidate,
}: {
  client: CoreApiClient;
  candidate: ActionableCallRecordingCandidate;
}): Promise<ReconcileActionableCandidateOutcome> => {
  console.warn(
    `[call-recorder] Recall bot ${candidate.externalBotId} for call recording ${candidate.id} no longer exists; it will not converge automatically`,
  );

  if (
    isCallRecordingStatusDowngrade({
      fromStatus: candidate.status,
      toStatus: CallRecordingStatus.FAILED,
    })
  ) {
    return { outcome: 'unconvergeable-after-bot-loss' };
  }

  await updateCallRecording(client, {
    id: candidate.id,
    data: {
      status: CallRecordingStatus.FAILED,
      callRecorderFailureReason: 'recall_bot_not_found',
    },
  });

  return { outcome: 'marked-failed-after-bot-loss' };
};

const rotateActionableCandidatesForFallback = ({
  candidates,
  now,
}: {
  candidates: ActionableCallRecordingCandidate[];
  now: Date;
}): ActionableCallRecordingCandidate[] => {
  if (candidates.length <= CONVERGENCE_PER_ID_FALLBACK_LIMIT) {
    return candidates;
  }

  const rotationOffset =
    Math.floor(
      now.getTime() / CONVERGENCE_PER_ID_FALLBACK_ROTATION_INTERVAL_MS,
    ) % candidates.length;

  return [
    ...candidates.slice(rotationOffset),
    ...candidates.slice(0, rotationOffset),
  ];
};

const listConvergenceBotsById = async (
  now: Date,
): Promise<Map<string, RecallBotSnapshot> | undefined> => {
  const currentWorkspaceId = getCurrentWorkspaceId();

  if (isUndefined(currentWorkspaceId)) {
    return new Map();
  }

  const listResult = await listScheduledRecallBots({
    joinAtAfter: new Date(
      now.getTime() - CONVERGENCE_BOT_LIST_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString(),
    joinAtBefore: new Date(
      now.getTime() + CONVERGENCE_BOT_LIST_LOOKAHEAD_MS,
    ).toISOString(),
    metadata: { twentyWorkspaceId: currentWorkspaceId },
  });

  if (!listResult.ok) {
    console.warn(
      `[call-recorder] failed to list Recall bots for convergence, deferring to the next run: ${listResult.errorMessage}`,
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

// createdAt is scheduling time and can predate the meeting by weeks, so it bounds only candidates with no other dates left.
const isOutsideConvergenceBound = (
  candidate: DivergedCallRecordingCandidate,
  convergenceLowerBound: Date,
): boolean => {
  const boundReference =
    candidate.calendarEventEndsAt ??
    candidate.calendarEventStartsAt ??
    candidate.endedAt ??
    candidate.startedAt ??
    candidate.createdAt;

  return (
    !isUndefined(boundReference) &&
    new Date(boundReference).getTime() < convergenceLowerBound.getTime()
  );
};

const isBeforeMeetingStart = (
  candidate: DivergedCallRecordingCandidate,
  now: Date,
): boolean =>
  !isUndefined(candidate.calendarEventStartsAt) &&
  new Date(candidate.calendarEventStartsAt).getTime() > now.getTime();
