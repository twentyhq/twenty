import { ACTIVE_RECALL_BOT_STATUSES } from 'src/logic-functions/constants/active-recall-bot-statuses';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

export const hasRecallBotEnded = (bot: RecallBotSnapshot): boolean =>
  bot.statusChanges.some(
    (statusChange) => !ACTIVE_RECALL_BOT_STATUSES.includes(statusChange.code),
  );
