import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';
import { readSlackAccessMode } from 'src/logic-functions/utils/read-slack-access-mode';

export const getSlackAccessMode = async (): Promise<SlackAccessMode> => {
  const result = await readSlackAccessMode();

  // An unreadable store is not an open workspace: only a store that answers
  // can say the restriction is off, so a failed read keeps it on.
  return result.status === 'READ'
    ? result.accessMode
    : SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;
};
