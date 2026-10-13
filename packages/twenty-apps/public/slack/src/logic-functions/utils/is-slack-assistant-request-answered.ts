import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { type SlackAssistantRequestOutcome } from 'src/logic-functions/types/slack-assistant-request-outcome.type';

// a request that failed only at Slack delivery still has its turn stored on the server
export const isSlackAssistantRequestAnswered = ({
  status,
  responseText,
}: SlackAssistantRequestOutcome): boolean =>
  status === SLACK_ASSISTANT_REQUEST_STATUS.DONE ||
  (status === SLACK_ASSISTANT_REQUEST_STATUS.FAILED &&
    isNonEmptyString(responseText));
