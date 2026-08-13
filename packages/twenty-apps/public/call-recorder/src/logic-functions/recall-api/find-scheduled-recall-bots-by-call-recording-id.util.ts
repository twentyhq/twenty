import { isUndefined } from '@sniptt/guards';

import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { getCurrentWorkspaceId } from 'src/logic-functions/data/get-current-workspace-id.util';
import {
  listScheduledRecallBots,
  type RecallScheduledBot,
} from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { type FindScheduledRecallBotsByCallRecordingIdResult } from 'src/logic-functions/types/find-scheduled-recall-bots-by-call-recording-id-result.type';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const findScheduledRecallBotsByCallRecordingId =
  async (): Promise<FindScheduledRecallBotsByCallRecordingIdResult> => {
    const workspaceId = getCurrentWorkspaceId();

    if (isUndefined(workspaceId)) {
      return { ok: true, recallBotsByCallRecordingId: new Map() };
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

    if (listResult.truncated) {
      console.warn(
        '[call-recorder] Recall bot list was truncated; deferring bot recovery to the next run',
      );

      return { ok: false };
    }

    const recallBotsByCallRecordingId = new Map<string, RecallScheduledBot[]>();

    for (const bot of listResult.bots) {
      const callRecordingId = bot.metadata.twentyCallRecordingId;

      if (!isNonEmptyString(callRecordingId)) {
        continue;
      }

      recallBotsByCallRecordingId.set(callRecordingId, [
        ...(recallBotsByCallRecordingId.get(callRecordingId) ?? []),
        bot,
      ]);
    }

    return { ok: true, recallBotsByCallRecordingId };
  };
