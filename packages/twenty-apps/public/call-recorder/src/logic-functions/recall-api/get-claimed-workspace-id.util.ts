import { type RecallScheduledBot } from 'src/logic-functions/recall-api/list-scheduled-recall-bots.util';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getClaimedWorkspaceId = (
  bot: RecallScheduledBot,
): string | undefined => {
  const claimedWorkspaceId = bot.metadata.twentyWorkspaceId;

  return isNonEmptyString(claimedWorkspaceId)
    ? claimedWorkspaceId.trim()
    : undefined;
};
