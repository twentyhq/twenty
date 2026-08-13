import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { CallRecordingRequestStatus } from 'src/logic-functions/constants/call-recording-request-status';
import { RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/recall-bot-active-call-recording-statuses';
import { clearCallRecordingBotOwnership } from 'src/logic-functions/data/clear-call-recording-bot-ownership.util';
import { findCallRecordingsByFilter } from 'src/logic-functions/data/find-call-recordings-by-filter.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasRecallBotScheduleAttemptSettled } from 'src/logic-functions/domain/has-recall-bot-schedule-attempt-settled.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { removeRecallBotOrThrow } from 'src/logic-functions/recall-api/remove-recall-bot-or-throw.util';
import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type RetryUnresolvedRecallBotRemovalsResult } from 'src/logic-functions/types/retry-unresolved-recall-bot-removals-result.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export const retryUnresolvedRecallBotRemovals = async ({
  client,
}: {
  client: CoreApiClient;
}): Promise<RetryUnresolvedRecallBotRemovalsResult> => {
  const removalCandidates = (
    await findCallRecordingsByFilter(client, {
      or: [
        {
          recordingRequestStatus: {
            eq: CallRecordingRequestStatus.CANCELED,
          },
          status: { in: RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES },
        },
        {
          deletedAt: { is: 'NOT_NULL' },
          status: { in: RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES },
        },
      ],
    })
  ).filter(hasUnresolvedRecallBotOwnership);

  if (removalCandidates.length === 0) {
    return { removedCallRecordingIds: [], failedCallRecordingIds: [] };
  }

  const listedRecallBots =
    await listActiveRecallBotsForRemovalCandidates(removalCandidates);
  const result: RetryUnresolvedRecallBotRemovalsResult = {
    removedCallRecordingIds: [],
    failedCallRecordingIds: [],
  };

  for (const removalCandidate of removalCandidates) {
    try {
      await retryRecallBotRemoval({
        client,
        callRecording: removalCandidate,
        listedRecallBots,
      });
      result.removedCallRecordingIds.push(removalCandidate.id);
    } catch (error) {
      console.warn(
        `[call-recorder] failed to finish Recall bot removal for callRecording ${removalCandidate.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      result.failedCallRecordingIds.push(removalCandidate.id);
    }
  }

  return result;
};

const hasUnresolvedRecallBotOwnership = (
  callRecording: CallRecordingRecord,
): boolean =>
  !isUndefined(callRecording.externalBotId) ||
  !isUndefined(callRecording.botScheduleAttemptedAt);

type ListedRecallBot = {
  id: string;
  callRecordingId: string | undefined;
  botScheduleIdempotencyKey: string | undefined;
};

type ListedRecallBotsResult = {
  complete: boolean;
  bots: ListedRecallBot[];
};

const listActiveRecallBotsForRemovalCandidates = async (
  removalCandidates: CallRecordingRecord[],
): Promise<ListedRecallBotsResult | undefined> => {
  if (
    !removalCandidates.some(
      (callRecording) => !isUndefined(callRecording.botScheduleAttemptedAt),
    )
  ) {
    return { complete: true, bots: [] };
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    return undefined;
  }

  const listResult = await listScheduledRecallBots({
    metadata: { twentyWorkspaceId: workspaceId },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    return undefined;
  }

  return {
    complete: !listResult.truncated,
    bots: listResult.bots.flatMap((bot) => {
      const callRecordingId = normalizeOptionalString(
        bot.metadata.twentyCallRecordingId,
      );

      if (isUndefined(callRecordingId)) {
        return [];
      }

      return [
        {
          id: bot.id,
          callRecordingId,
          botScheduleIdempotencyKey: normalizeOptionalString(
            bot.metadata.twentyBotScheduleIdempotencyKey,
          ),
        },
      ];
    }),
  };
};

const retryRecallBotRemoval = async ({
  client,
  callRecording,
  listedRecallBots,
}: {
  client: CoreApiClient;
  callRecording: CallRecordingRecord;
  listedRecallBots: ListedRecallBotsResult | undefined;
}): Promise<void> => {
  const botScheduleIdempotencyKey = callRecording.botScheduleIdempotencyKey;
  const needsCompleteLookup = !isUndefined(
    callRecording.botScheduleAttemptedAt,
  );
  const matchingListedExternalBotIds =
    listedRecallBots?.bots
      .filter(
        (bot) =>
          bot.callRecordingId === callRecording.id &&
          (isUndefined(bot.botScheduleIdempotencyKey) ||
            bot.botScheduleIdempotencyKey === botScheduleIdempotencyKey),
      )
      .map((bot) => bot.id) ?? [];
  const externalBotIds = getUniqueSortedIds([
    ...(isUndefined(callRecording.externalBotId)
      ? []
      : [callRecording.externalBotId]),
    ...matchingListedExternalBotIds,
  ]);

  for (const externalBotId of externalBotIds) {
    await removeRecallBotOrThrow(externalBotId);
  }

  if (
    needsCompleteLookup &&
    (isUndefined(listedRecallBots) || !listedRecallBots.complete)
  ) {
    throw new Error('active Recall bot lookup was incomplete');
  }

  if (
    externalBotIds.length === 0 &&
    !isUndefined(callRecording.botScheduleAttemptedAt) &&
    !hasRecallBotScheduleAttemptSettled(callRecording.botScheduleAttemptedAt)
  ) {
    throw new Error('Recall bot creation is still settling');
  }

  await clearCallRecordingBotOwnership(client, {
    callRecordingId: callRecording.id,
    expectedExternalBotId: callRecording.externalBotId ?? null,
    expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
  });
};
