import { kv } from 'twenty-sdk/logic-function';

import {
  SLACK_ACCESS_MODE,
  SLACK_ACCESS_MODE_KV_KEY,
  type SlackAccessMode,
} from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessModeRead } from 'src/logic-functions/types/slack-access-mode-read.type';

export const readSlackAccessMode = async (): Promise<SlackAccessModeRead> => {
  try {
    const stored = await kv.get<string>(SLACK_ACCESS_MODE_KV_KEY, {
      scope: 'WORKSPACE',
    });

    return {
      status: 'READ',
      accessMode:
        stored === SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
          ? SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS
          : SLACK_ACCESS_MODE.ANYONE,
    };
  } catch {
    return { status: 'UNREADABLE' };
  }
};

export const getSlackAccessMode = async (): Promise<SlackAccessMode> => {
  const result = await readSlackAccessMode();

  // An unreadable store is not an open workspace: only a store that answers
  // can say the restriction is off, so a failed read keeps it on.
  return result.status === 'READ'
    ? result.accessMode
    : SLACK_ACCESS_MODE.ONLY_LINKED_MEMBERS;
};
