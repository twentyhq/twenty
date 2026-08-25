import { kv } from 'twenty-sdk/logic-function';

import {
  SLACK_ACCESS_MODE,
  SLACK_ACCESS_MODE_KV_KEY,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';

export const getSlackAccessMode = async (): Promise<SlackAccessMode> => {
  const stored = await kv
    .get<string>(SLACK_ACCESS_MODE_KV_KEY, { scope: 'WORKSPACE' })
    .catch(() => null);

  return stored === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
    ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
    : SLACK_ACCESS_MODE.ANYONE;
};
