import { isUndefined } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/recall-bot-active-call-recording-statuses';
import { clearCallRecordingBotOwnership } from 'src/logic-functions/data/clear-call-recording-bot-ownership.util';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { hasRecallBotScheduleAttemptSettled } from 'src/logic-functions/domain/has-recall-bot-schedule-attempt-settled.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { removeRecallBotOrThrow } from 'src/logic-functions/recall-api/remove-recall-bot-or-throw.util';
import { type RemovedCallRecordingRecallFields } from 'src/logic-functions/types/removed-call-recording-recall-fields.type';
import { type RemoveRecallBotsForRemovedCallRecordingResult } from 'src/logic-functions/types/remove-recall-bots-for-removed-call-recording-result.type';
import { getUniqueSortedIds } from 'src/logic-functions/utils/get-unique-sorted-ids.util';
import { normalizeOptionalString } from 'src/logic-functions/utils/normalize-optional-string.util';

export const removeRecallBotsForRemovedCallRecording = async ({
  client,
  callRecordingId,
  status,
  externalBotId: rawExternalBotId,
  botScheduleAttemptedAt,
  botScheduleIdempotencyKey: rawBotScheduleIdempotencyKey,
}: RemovedCallRecordingRecallFields & {
  client: CoreApiClient;
  callRecordingId: string;
}): Promise<RemoveRecallBotsForRemovedCallRecordingResult> => {
  if (
    !isUndefined(status) &&
    !RECALL_BOT_ACTIVE_CALL_RECORDING_STATUSES.some(
      (activeStatus) => activeStatus === status,
    )
  ) {
    return { removedExternalBotIds: [] };
  }

  const externalBotId = normalizeOptionalString(rawExternalBotId);
  const botScheduleIdempotencyKey = normalizeOptionalString(
    rawBotScheduleIdempotencyKey,
  );

  if (!isUndefined(externalBotId)) {
    await removeRecallBotOrThrow(externalBotId);
    await clearCallRecordingBotOwnership(client, {
      callRecordingId,
      expectedExternalBotId: externalBotId,
      expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
    });

    return { removedExternalBotIds: [externalBotId] };
  }

  const normalizedBotScheduleAttemptedAt = normalizeOptionalString(
    botScheduleAttemptedAt,
  );

  if (isUndefined(normalizedBotScheduleAttemptedAt)) {
    return { removedExternalBotIds: [] };
  }

  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    throw new Error(
      `Cannot find Recall bots for removed CallRecording ${callRecordingId}: workspace id unavailable`,
    );
  }

  const listResult = await listScheduledRecallBots({
    metadata: {
      twentyWorkspaceId: workspaceId,
      twentyCallRecordingId: callRecordingId,
    },
    statuses: ACTIVE_RECALL_BOT_STATUSES,
  });

  if (!listResult.ok) {
    throw new Error(
      `Failed to find Recall bots for removed CallRecording ${callRecordingId}: ${listResult.errorMessage}`,
    );
  }

  const matchingExternalBotIds = getUniqueSortedIds(
    listResult.bots
      .filter(
        (bot) =>
          bot.metadata.twentyWorkspaceId === workspaceId &&
          bot.metadata.twentyCallRecordingId === callRecordingId &&
          matchesBotScheduleGeneration({
            botScheduleIdempotencyKey: normalizeOptionalString(
              bot.metadata.twentyBotScheduleIdempotencyKey,
            ),
            expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
          }),
      )
      .map((bot) => bot.id),
  );

  for (const matchingExternalBotId of matchingExternalBotIds) {
    await removeRecallBotOrThrow(matchingExternalBotId);
  }

  if (listResult.truncated) {
    throw new Error(
      `Failed to find every Recall bot for removed CallRecording ${callRecordingId}: result was truncated`,
    );
  }

  if (
    matchingExternalBotIds.length === 0 &&
    !hasRecallBotScheduleAttemptSettled(normalizedBotScheduleAttemptedAt)
  ) {
    throw new Error(
      `Recall bot creation is still settling for removed CallRecording ${callRecordingId}`,
    );
  }

  await clearCallRecordingBotOwnership(client, {
    callRecordingId,
    expectedExternalBotId: null,
    expectedBotScheduleIdempotencyKey: botScheduleIdempotencyKey,
  });

  return { removedExternalBotIds: matchingExternalBotIds };
};

const matchesBotScheduleGeneration = ({
  botScheduleIdempotencyKey,
  expectedBotScheduleIdempotencyKey,
}: {
  botScheduleIdempotencyKey: string | undefined;
  expectedBotScheduleIdempotencyKey: string | undefined;
}): boolean =>
  isUndefined(botScheduleIdempotencyKey) ||
  botScheduleIdempotencyKey === expectedBotScheduleIdempotencyKey;
