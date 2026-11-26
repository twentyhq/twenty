import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { hasKvEntryExpired } from 'src/logic-functions/utils/has-kv-entry-expired';

const SLACK_JOB_FAILURE_REPLY_TTL_MS = 60 * 60 * 1000;

type SlackJobFailureReplyClaim = {
  expiresAt: number;
};

export const claimSlackJobFailureReply = async (
  requestId: string,
): Promise<boolean> => {
  const key = `slack-job-failure-reply:${requestId}`;
  const existingClaim = await kv.get<SlackJobFailureReplyClaim>(key);

  if (isDefined(existingClaim) && !hasKvEntryExpired(existingClaim)) {
    return false;
  }

  await kv.set(key, {
    expiresAt: Date.now() + SLACK_JOB_FAILURE_REPLY_TTL_MS,
  });

  return true;
};
