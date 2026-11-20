import { isNonEmptyString } from '@sniptt/guards';

import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { getSlackAssistantRequestLeaseCutoff } from 'src/logic-functions/utils/get-slack-assistant-request-lease-cutoff';

export const isSlackAssistantRequestStale = (
  record: Pick<SlackAssistantRequestRecord, 'updatedAt'>,
): boolean =>
  isNonEmptyString(record.updatedAt) &&
  new Date(record.updatedAt) < getSlackAssistantRequestLeaseCutoff();
