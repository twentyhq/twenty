import { isUndefined } from '@sniptt/guards';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import { listScheduledRecallBots } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export type FindScheduledRecallBotIdsByCallRecordingOwnershipResult =
  | {
      ok: true;
      externalBotIdsByCallRecordingId: Map<
        string,
        Map<string | undefined, string>
      >;
    }
  | { ok: false };

// One workspace-wide list request covers every pending recording; Recall's
// list endpoint has the tightest rate budget, so per-recording lookups must
// not fan out.
export const findScheduledRecallBotIdsByCallRecordingOwnership =
  async (): Promise<FindScheduledRecallBotIdsByCallRecordingOwnershipResult> => {
    const workspaceId = getCurrentWorkspaceId();

    if (isUndefined(workspaceId)) {
      return { ok: true, externalBotIdsByCallRecordingId: new Map() };
    }

    const listResult = await listScheduledRecallBots({
      metadata: { twentyWorkspaceId: workspaceId },
      statuses: ACTIVE_RECALL_BOT_STATUSES,
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

    const externalBotIdsByCallRecordingId = new Map<
      string,
      Map<string | undefined, string>
    >();

    for (const bot of listResult.bots) {
      const callRecordingId = bot.metadata.twentyCallRecordingId;
      const botScheduleAttemptId = isNonEmptyString(
        bot.metadata.twentyBotScheduleAttemptId,
      )
        ? bot.metadata.twentyBotScheduleAttemptId
        : undefined;

      if (!isNonEmptyString(callRecordingId)) {
        continue;
      }

      const externalBotIdsByAttemptId =
        externalBotIdsByCallRecordingId.get(callRecordingId) ?? new Map();

      if (externalBotIdsByAttemptId.has(botScheduleAttemptId)) {
        continue;
      }

      externalBotIdsByAttemptId.set(botScheduleAttemptId, bot.id);
      externalBotIdsByCallRecordingId.set(
        callRecordingId,
        externalBotIdsByAttemptId,
      );
    }

    return { ok: true, externalBotIdsByCallRecordingId };
  };
