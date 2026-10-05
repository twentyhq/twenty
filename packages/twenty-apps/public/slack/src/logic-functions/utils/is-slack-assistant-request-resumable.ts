import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { getSlackAssistantRequestLeaseCutoff } from 'src/logic-functions/utils/get-slack-assistant-request-lease-cutoff';

export const isSlackAssistantRequestResumable = (
  record: Pick<SlackAssistantRequestRecord, 'status' | 'updatedAt'>,
  { nowMs = Date.now() }: { nowMs?: number } = {},
): boolean => {
  if (record.status === SLACK_ASSISTANT_REQUEST_STATUS.PENDING) {
    return true;
  }

  if (
    record.status !== SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING ||
    !isNonEmptyString(record.updatedAt)
  ) {
    return false;
  }

  return (
    new Date(record.updatedAt) < getSlackAssistantRequestLeaseCutoff(nowMs)
  );
};
