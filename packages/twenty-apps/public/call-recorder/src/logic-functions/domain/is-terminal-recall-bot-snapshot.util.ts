import { TERMINAL_RECALL_BOT_STATUS_CODES } from 'src/logic-functions/constants/terminal-recall-bot-status-codes';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

// Terminal states are absorbing, so any terminal entry settles it; this needs
// no ordering or timestamps, which Recall does not guarantee.
export const isTerminalRecallBotSnapshot = (bot: RecallBotSnapshot): boolean =>
  bot.statusChanges.some((statusChange) =>
    (TERMINAL_RECALL_BOT_STATUS_CODES as readonly string[]).includes(
      statusChange.code,
    ),
  );
