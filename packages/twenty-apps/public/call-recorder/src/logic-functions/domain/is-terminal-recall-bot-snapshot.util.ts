import { isUndefined } from '@sniptt/guards';

import { TERMINAL_RECALL_BOT_STATUS_CODES } from 'src/logic-functions/constants/terminal-recall-bot-status-codes';
import { getLatestRecallBotStatusChange } from 'src/logic-functions/recall-api/get-latest-recall-bot-status-change.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

export const isTerminalRecallBotSnapshot = (
  bot: RecallBotSnapshot,
): boolean => {
  const latestStatusChange = getLatestRecallBotStatusChange(bot.statusChanges);

  if (isUndefined(latestStatusChange)) {
    return false;
  }

  return (TERMINAL_RECALL_BOT_STATUS_CODES as readonly string[]).includes(
    latestStatusChange.code,
  );
};
