import { SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH } from 'src/logic-functions/constants/slack-assistant-request-name-max-length';

export const buildSlackAssistantRequestName = (requestText: string): string =>
  requestText.length > SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH
    ? `${requestText.slice(0, SLACK_ASSISTANT_REQUEST_NAME_MAX_LENGTH - 1)}…`
    : requestText;
