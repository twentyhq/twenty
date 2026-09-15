import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { SLACK_ACCESS_MODE_KV_KEY } from 'src/logic-functions/constants/slack-access-mode-kv-key';
import { type SlackAccessModeRead } from 'src/logic-functions/types/slack-access-mode-read.type';
import { isSlackAccessMode } from 'src/logic-functions/utils/is-slack-access-mode';

export const readSlackAccessMode = async (): Promise<SlackAccessModeRead> => {
  try {
    const stored = await kv.get<string>(SLACK_ACCESS_MODE_KV_KEY, {
      scope: 'WORKSPACE',
    });

    if (!isNonEmptyString(stored)) {
      return { status: 'READ', accessMode: SLACK_ACCESS_MODE.ANYONE };
    }

    // A stored value this version cannot interpret is not a deliberate choice
    // to open the workspace, so it reads as unreadable rather than as ANYONE.
    if (!isSlackAccessMode(stored)) {
      return { status: 'UNREADABLE' };
    }

    return { status: 'READ', accessMode: stored };
  } catch {
    return { status: 'UNREADABLE' };
  }
};
