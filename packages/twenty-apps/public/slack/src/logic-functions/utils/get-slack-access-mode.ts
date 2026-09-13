import { kv } from 'twenty-sdk/logic-function';

import {
  SLACK_ACCESS_MODE,
  SLACK_ACCESS_MODE_KV_KEY,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';

export const getSlackAccessMode = async (): Promise<SlackAccessMode> => {
  try {
    const stored = await kv.get<string>(SLACK_ACCESS_MODE_KV_KEY, {
      scope: 'WORKSPACE',
    });

    return stored === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
      ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
      : SLACK_ACCESS_MODE.ANYONE;
  } catch {
    // An unreadable store is not an open workspace: only a store that answers
    // can say the restriction is off, so a failed read keeps it on.
    return SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;
  }
};
