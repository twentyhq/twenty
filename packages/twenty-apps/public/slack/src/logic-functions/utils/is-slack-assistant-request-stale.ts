import { isNonEmptyString } from '@sniptt/guards';

import { getSlackAssistantRequestLeaseCutoff } from 'src/logic-functions/utils/get-slack-assistant-request-lease-cutoff';

export const isSlackAssistantRequestStale = ({
  updatedAt,
  nowMs = Date.now(),
}: {
  updatedAt: string | undefined;
  nowMs?: number;
}): boolean =>
  isNonEmptyString(updatedAt) &&
  new Date(updatedAt) < getSlackAssistantRequestLeaseCutoff(nowMs);
