import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantRequestStatus } from 'src/logic-functions/types/slack-assistant-request-status.type';

export const isSlackAssistantRequestStatus = (
  value: unknown,
): value is SlackAssistantRequestStatus =>
  Object.values(SLACK_ASSISTANT_REQUEST_STATUS).some(
    (status) => status === value,
  );
