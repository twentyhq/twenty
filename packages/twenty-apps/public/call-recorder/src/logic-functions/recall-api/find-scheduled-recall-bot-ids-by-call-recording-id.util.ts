import { isUndefined } from '@sniptt/guards';

import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { buildRecallRoutingMetadata } from 'src/logic-functions/domain/build-recall-routing-metadata.util';
import { hasRecallBotEnded } from 'src/logic-functions/recall-api/has-recall-bot-ended.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';

export type FindScheduledRecallBotIdsByCallRecordingIdResult =
  | { ok: true; externalBotIdByCallRecordingId: Map<string, string> }
  | { ok: false };

export const findScheduledRecallBotIdsByCallRecordingId = async (
  callRecordingIds: string[],
): Promise<FindScheduledRecallBotIdsByCallRecordingIdResult> => {
  const workspaceId = getCurrentWorkspaceId();

  if (isUndefined(workspaceId)) {
    return { ok: true, externalBotIdByCallRecordingId: new Map() };
  }

  const externalBotIdByCallRecordingId = new Map<string, string>();

  for (const callRecordingId of callRecordingIds) {
    // No status filter: a bot scheduled for later has no status until it starts joining.
    const listResult = await listScheduledRecallBots({
      metadata: buildRecallRoutingMetadata({ callRecordingId, workspaceId }),
    });

    if (!listResult.ok) {
      console.warn(
        `[call-recorder] failed to look up existing Recall bots for pending call recordings: ${listResult.errorMessage}`,
      );

      return { ok: false };
    }

    // A truncated list can hide existing bots; callers treat a map miss as
    // permission to create, so an incomplete map must read as a failed lookup.
    if (listResult.truncated) {
      console.warn(
        '[call-recorder] Recall bot list was truncated; deferring bot recovery to the next run',
      );

      return { ok: false };
    }

    const scheduledBot = listResult.bots.find(
      (bot) =>
        bot.metadata.twentyCallRecordingId === callRecordingId &&
        !hasRecallBotEnded(bot),
    );

    if (!isUndefined(scheduledBot)) {
      externalBotIdByCallRecordingId.set(callRecordingId, scheduledBot.id);
    }
  }

  return { ok: true, externalBotIdByCallRecordingId };
};
