import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantRequestRecord } from 'src/logic-functions/types/slack-assistant-request-record.type';
import { isSlackAssistantRequestStale } from 'src/logic-functions/utils/is-slack-assistant-request-stale';

export const isSlackAssistantRequestResumable = (
  record: Pick<SlackAssistantRequestRecord, 'status' | 'updatedAt'>,
  { nowMs = Date.now() }: { nowMs?: number } = {},
): boolean =>
  record.status === SLACK_ASSISTANT_REQUEST_STATUS.PENDING ||
  (record.status === SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING &&
    isSlackAssistantRequestStale(record, { nowMs }));
